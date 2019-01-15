import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import initialValue from './_value';
import Icon from './Icon';

document.title = 'Slate Editor Project';
const value = Value.fromJSON(initialValue);
const DEFAULT_NODE = 'paragraph';

function insertImage(editor, src, target) {}

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

    return (
      <button onClick={(event) => this.activateBlock(event, type)}>
        {name}
      </button>
    );
  };

  activateBlock = (event, type) => {
    event.preventDefault();

    const { editor } = this;
    const { value } = editor;
    const { document } = value;
    const { alert } = this.props;

    if (['image'].includes(type)) {
      // Show URl prompt
      this.getImageUrlPrompt();
    }

    if (['imageBrowser'].includes(type)) {
      /**
       * Convert image in base64
       * Validate Image type
       *
       * @param {File} file
       */
      const getBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          if (file.type !== 'image/jpeg') {
            alert.error('Only JPEG file');
            return;
          }
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      getBase64(event.currentTarget.files[0]).then((imageData) => {
        // Show image in editor
        editor.command(insertImage, imageData);
      });
    }

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = this.hasBlock(type);
      const isList = this.hasBlock('list-item');

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item');
      const isType = value.blocks.some(
        (block) =>
          !!document.getClosest(block.key, (parent) => parent.type === type)
      );

      if (isList && isType) {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else if (isList) {
        editor
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type);
      } else {
        editor.setBlocks('list-item').wrapBlock(type);
      }
    }
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

  // Render Node Function
  renderNode = (props, editor, next) => {
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
            renderNode={this.renderNode}
          />
        </div>
      </div>
    );
  }
}
