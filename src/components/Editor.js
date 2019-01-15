import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import initialValue from './_value';
import Icon from './Icon';

document.title = 'Slate Editor Project';
const value = Value.fromJSON(initialValue);

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

  hasBlock = (type) => {
    let { value } = this.state;
    return value.blocks.some((node) => node.type === type);
  };

  renderBlockButton = (type, name) => {
    let isActive = this.hasBlock(type);

    if (type === 'numbered-list' || type === 'bulleted-list') {
      let { value } = this.state;
      if (value.blocks.size > 0) {
        let parent = value.document.getParent(value.blocks.first().key);
        isActive = this.hasBlock('list-item') && parent && parent.type === type;
      }
    }

    return <button>{name}</button>;
  };

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
        <div id="header">
          <div className="wrapper">
            <div id="toolbar">
              {this.renderBlockButton('heading-one', 'H1')}
              {this.renderBlockButton('heading-two', 'H2')}
              {this.renderBlockButton('block-quote', 'Quote')}
              {this.renderBlockButton('numbered-list', 'ol')}
              {this.renderBlockButton('bulleted-list', 'ul')}
            </div>
            <div id="menu">
              <button>Cancel</button>
              <button>Save</button>
            </div>
          </div>
        </div>
        <div id="paper" className="wrapper">
          <Editor
            ref={this.ref}
            placeholder="Start writing.."
            value={this.state.value}
            onChange={this.onChange}
            plugins={plugins}
            renderMark={this.renderMark}
          />
        </div>
      </div>
    );
  }
}
