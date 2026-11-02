// Greyhoarder's own lint rules, in the ESLint plugin format: the client loads them into ESLint,
// the server into oxlint (jsPlugins). They follow patterns of anti-slop
// (https://github.com/dmmulroy/anti-slop) without its code; docs/coding-guidelines.md, "Types", says why.

const FUNCTION_TYPES = [
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'TSDeclareFunction',
  'TSEmptyBodyFunctionExpression',
  'TSMethodSignature',
  'TSFunctionType',
];

/** `unknown`, or a union that contains it. */
function isUnknown(type) {
  return type?.type === 'TSUnknownKeyword' || (type?.type === 'TSUnionType' && type.types.some(isUnknown));
}

/** A type that says nothing about a dictionary's values: `unknown`, `any`, `object` or `{}`. */
function isOpenValue(type) {
  return (
    ['TSUnknownKeyword', 'TSAnyKeyword', 'TSObjectKeyword'].includes(type?.type) ||
    (type?.type === 'TSTypeLiteral' && type.members.length === 0)
  );
}

function typeArgumentsOf(reference) {
  return (reference.typeArguments ?? reference.typeParameters)?.params ?? [];
}

function isReferenceTo(type, ...names) {
  return type?.type === 'TSTypeReference' && type.typeName.type === 'Identifier' && names.includes(type.typeName.name);
}

function isInside(node, type) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === type) return true;
  }
  return false;
}

function onFunctions(check) {
  return Object.fromEntries(FUNCTION_TYPES.map((type) => [type, check]));
}

const noChainedTypeAssertions = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow asserting a type on top of another assertion, e.g. `as unknown as`.' },
    messages: { chained: 'Two type assertions in a row hide a type that does not fit. Fix the type instead.' },
    schema: [],
  },
  create(context) {
    const isAssertion = (node) => node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion';
    const check = (node) => {
      const isAsConst = isReferenceTo(node.typeAnnotation, 'const');
      if (!isAsConst && isAssertion(node.expression)) context.report({ node, messageId: 'chained' });
    };
    return { TSAsExpression: check, TSTypeAssertion: check };
  },
};

const noUnknownReturns = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow functions that return `unknown` or a promise of it.' },
    messages: { unknown: 'This function hands `unknown` to its caller. Return a named type instead.' },
    schema: [],
  },
  create(context) {
    return onFunctions((node) => {
      const type = node.returnType?.typeAnnotation;
      const promised = isReferenceTo(type, 'Promise', 'PromiseLike') ? typeArgumentsOf(type)[0] : undefined;
      if (isUnknown(type) || isUnknown(promised)) context.report({ node: node.returnType, messageId: 'unknown' });
    });
  },
};

const noUnknownParameters = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow `unknown` parameters, except an error named `cause` and a type guard subject.' },
    messages: {
      unknown:
        'Parameter `{{name}}` takes input nobody parsed. Accept a named type and parse at the boundary; name an unknown error `cause`.',
    },
    schema: [],
  },
  create(context) {
    return onFunctions((node) => {
      const returned = node.returnType?.typeAnnotation;
      const guarded = returned?.type === 'TSTypePredicate' ? returned.parameterName?.name : undefined;
      for (const param of node.params ?? []) {
        const id =
          param.type === 'AssignmentPattern'
            ? param.left
            : param.type === 'TSParameterProperty'
              ? param.parameter
              : param;
        const isAllowed = id.name === 'cause' || id.name === guarded;
        if (id.type === 'Identifier' && !isAllowed && isUnknown(id.typeAnnotation?.typeAnnotation)) {
          context.report({ node: id, messageId: 'unknown', data: { name: id.name } });
        }
      }
    });
  },
};

const noUnsafeDictionaryType = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow dictionaries whose values are `unknown`, `any`, `object` or `{}`.' },
    messages: {
      open: 'This dictionary says nothing about its values. Give them a named type, parsed at the boundary.',
    },
    schema: [],
  },
  create(context) {
    const report = (node) => {
      if (!isInside(node, 'TSTypeParameter')) context.report({ node, messageId: 'open' });
    };
    return {
      TSTypeReference(node) {
        if (isReferenceTo(node, 'Record') && isOpenValue(typeArgumentsOf(node)[1])) report(node);
      },
      TSIndexSignature(node) {
        if (isOpenValue(node.typeAnnotation?.typeAnnotation)) report(node);
      },
    };
  },
};

const noRuntimeTypeof = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow `typeof` checks; parse input at its boundary and branch on domain values.' },
    messages: {
      typeof:
        'A `typeof` check narrows a representation, not a contract. Parse at the boundary, or tell the cases apart by a property.',
    },
    schema: [],
  },
  create(context) {
    return {
      UnaryExpression(node) {
        if (node.operator !== 'typeof') return;
        const { parent } = node;
        const other =
          parent?.type === 'BinaryExpression' ? (parent.left === node ? parent.right : parent.left) : undefined;
        if (other?.type === 'Literal' && other.value === 'undefined') return;
        context.report({ node, messageId: 'typeof' });
      },
    };
  },
};

const noKnownValueWidening = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow anonymous object types in return types and annotations that widen a known value.' },
    messages: {
      anonymousReturn: 'Name the type this function returns, instead of an anonymous object type.',
      widened:
        'This annotation is wider than the value it holds. Keep the inferred type, use `satisfies`, or name the type.',
    },
    schema: [],
  },
  create(context) {
    const isWide = (type) =>
      ['TSUnknownKeyword', 'TSObjectKeyword', 'TSTypeLiteral'].includes(type?.type) ||
      (isReferenceTo(type, 'Record') && typeArgumentsOf(type)[0]?.type === 'TSStringKeyword');
    const isEmpty = (value) =>
      (value.type === 'ObjectExpression' && value.properties.length === 0) ||
      (value.type === 'ArrayExpression' && value.elements.length === 0);
    return {
      ...onFunctions((node) => {
        if (node.returnType?.typeAnnotation?.type === 'TSTypeLiteral') {
          context.report({ node: node.returnType, messageId: 'anonymousReturn' });
        }
      }),
      VariableDeclarator(node) {
        const type = node.id.typeAnnotation?.typeAnnotation;
        if (node.init && !isEmpty(node.init) && isWide(type)) context.report({ node: node.id, messageId: 'widened' });
      },
    };
  },
};

/**
 * Blank lines for `@stylistic/padding-line-between-statements`: around imports, declarations,
 * multiline bindings and blocks, and before control flow. The server's .oxlintrc.json repeats them.
 */
export const READABLE_SPACING = [
  { blankLine: 'always', prev: 'import', next: '*' },
  { blankLine: 'any', prev: 'import', next: 'import' },
  { blankLine: 'always', prev: '*', next: ['function', 'class', 'interface', 'type', 'multiline-export'] },
  { blankLine: 'always', prev: ['function', 'class', 'interface', 'type', 'multiline-export'], next: '*' },
  { blankLine: 'always', prev: '*', next: ['multiline-const', 'multiline-let', 'multiline-var'] },
  { blankLine: 'always', prev: ['multiline-const', 'multiline-let', 'multiline-var'], next: '*' },
  { blankLine: 'always', prev: '*', next: ['return', 'if', 'switch', 'try', 'for', 'while', 'do'] },
  { blankLine: 'always', prev: 'block-like', next: '*' },
];

export default {
  meta: { name: 'greyhoarder' },
  rules: {
    'no-chained-type-assertions': noChainedTypeAssertions,
    'no-known-value-widening': noKnownValueWidening,
    'no-runtime-typeof': noRuntimeTypeof,
    'no-unknown-parameters': noUnknownParameters,
    'no-unknown-returns': noUnknownReturns,
    'no-unsafe-dictionary-type': noUnsafeDictionaryType,
  },
};
