import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import initialValue from './_value';
const value = Value.fromJSON(initialValue);

/**
 * Main app component file
 */
export default class Editor extends Component {
  state = {
    value
  };

  onChange = ({ value }) => {
    this.setState({ value });
  };

  ref = (editor) => (this.editor = editor);

  render() {
    return (
      <div id="shell">
        <div id="header">Toolbar</div>
        <Editor
          ref={this.ref}
          placeholder="Start writing.."
          value={this.state.value}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
