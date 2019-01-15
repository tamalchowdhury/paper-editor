import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import initialValue from './_value';
const value = Value.fromJSON(initialValue);

document.title = 'Slate Editor Project';

function MarkHotkeys(options) {
  let { key, type } = options;
  return {
    onKeyDown(event, editor, next) {
      if (!event.ctrlKey || event.key !== key) return next();
      event.preventDefault();
      editor.toggleMark(type);
    }
  };
}

const plugins = [
  MarkHotkeys({ key: 'b', type: 'bold' }),
  MarkHotkeys({ key: 'i', type: 'italic' }),
  MarkHotkeys({ key: 'u', type: 'underline' }),
  MarkHotkeys({ key: '-', type: 'strikethrough' }),
  MarkHotkeys({ key: '`', type: 'code' })
];

/**
 * Main app component file
 */
export default class MyEditor extends Component {
  state = {
    value
  };

  onChange = ({ value }) => {
    this.setState({ value });
  };

  ref = (editor) => (this.editor = editor);

  // Render Mark Function
  renderMark = (props, editor, next) => {
    let { mark, attributes, children } = props;
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underline':
        return <u {...attributes}>{children}</u>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'strikethrough':
        return <del {...attributes}>{children}</del>;
      default:
        return next();
    }
  };

  // Render Block Function
  renderBlock = (props, editor, next) => {
    let { node, attributes, children } = props;
    switch (node.type) {
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'blockquote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'code':
        return (
          <pre {...attributes}>
            <code>{children}</code>
          </pre>
        );
      case 'image':
        let src = node.data.get('src');
        return <img src={src} {...attributes} />;
      default:
        return next();
    }
  };

  render() {
    return (
      <div id="shell">
        <div id="header">Toolbar</div>
        <Editor
          ref={this.ref}
          placeholder="Start writing.."
          value={this.state.value}
          onChange={this.onChange}
          plugins={plugins}
          renderMark={this.renderMark}
        />
      </div>
    );
  }
}
