module.exports = function(file, api) {
    const jscodeshift = api.jscodeshift;
    return jscodeshift(file.source)
        .find(jscodeshift.ExpressionStatement)
        .filter((path) => path.parentPath.node.type === 'Program' &&
            path.node.expression.type === 'CallExpression' &&
            path.node.expression.callee.type === 'Identifier' &&
            path.node.expression.callee.name === 'define')
        .replaceWith((path) => {
            const functionExpression = path.node.expression.arguments[ 0 ];
            const comments = path.node.comments;
            const result = [];
            const leading = [];
            let isLeading = true;
            functionExpression.body.body.forEach((item, index) => {
                //处理开头的注释
                if (index === 0 && comments && comments.length) {
                    const firstNode = item;
                    firstNode.comments = [];
                    comments.forEach((comment) => {
                        switch (comment.type) {
                            case 'CommentLine':
                                firstNode.comments.push(jscodeshift.commentLine(
                                    comment.value, comment.leading, comment.trailing));
                                break;
                            case 'CommentBlock':
                                firstNode.comments.push(jscodeshift.commentBlock(
                                    comment.value, comment.leading, comment.trailing));
                                break;
                        }
                    });
                    item = firstNode;
                }
                if (isLeading &&
                    item.type === 'ExpressionStatement' &&
                    item.expression.type === 'Literal') {
                    leading.push(item);
                } else if (item.type === 'ReturnStatement') {
                    const returnStatement = jscodeshift(item)
                        .toSource()
                        .replace('return ', 'module.exports = ');
                    isLeading = false;
                    result.push(returnStatement);
                } else {
                    isLeading = false;
                    result.push(item);
                }
            });
            return leading.concat(result);
        })
        .toSource();
}