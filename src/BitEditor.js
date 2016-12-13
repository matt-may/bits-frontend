import React, { Component } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js';
import { StickyContainer, Sticky } from 'react-sticky';

import constants from './Constants';
import { checkStatus, parseJSON } from './Helpers';

import './Sticky.css';
import './StickyEditor.css';

class BitEditor extends Component {
  constructor(props) {
    super(props);

    // If we've been given the newBit prop, send a request to the backend to
    // create a new bit. The backend will return the id of the new bit. Set
    // this.bitID to that ID.
    if (this.props.newBit)
      this.createNewBit();
    // If we haven't been told to create a new bit, set this.bitID to the
    // specified already existing bitID. In this scenario, we are performing an
    // edit of an existing bit, not creating a new one.
    else {
      this.bitID = this.props.bitID;
    }

    // Initialize our state.
    // `fullWindow` specifies whether the editor is currently consuming the
    //   full browser window.
    // `inSync` specifies whether the server and client version of the bit
    //   are in sync. Initially this will be true, however it will become
    //   untrue as edits are made locally. Periodic calls to updateBit() will
    //   update this to true.
    this.state = { editorState: EditorState.createEmpty(),
                   fullWindow: false, inSync: true };

    this.focus = () => this.refs.editor.focus();

    this.onChange = (editorState) => {
      this.setState({ editorState, inSync: false });
      this.updateBit();

      //console.log();
      //console.log()
    }

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.onTab = (e) => this._onTab(e);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.toggleFullWindow = () => this._toggleFullWindow();
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _toggleFullWindow() {
    this.setState((prevState) => {
      return { fullWindow: !prevState.fullWindow }
    });
  }

  // Sends a request to our backend to create a new bit. If successful, sets
  // this.bitID to the ID of the newly created bit.
  createNewBit() {
    fetch(constants.BITS_PATH, { method: 'POST' })
    .then(checkStatus)
    .then(parseJSON)
    .then((body) => {
      this.bitID = body.id;
    });
  }

  // Sends a request to our backend to update the bit. If successful, updates
  // inSync in the state to true.
  updateBit() {
    if (!this.bitID)
      return

    let state = this.state.editorState;

    fetch(constants.BITS_PATH + `/${this.bitID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bit: {
          body: state.getCurrentContent().getPlainText(),
          js_body: JSON.stringify(convertToRaw(state.getCurrentContent())),
        }
      })
    })
    .then(checkStatus)
    .then(() => {
      this.setState({ inSync: true });
    });
  }

  render() {
    const { editorState } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'editor-rich-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' editor-rich-hidePlaceholder';
      }
    }

    // Make the editor span the window if the option has been toggled.
    let wrapperClassName = 'editor-rich-root';
    if (this.state.fullWindow)
      wrapperClassName += ' editor-full-window';

    return (
      <div className={wrapperClassName}>
        <StickyContainer>
          <Sticky stickyClassName='sticky editor-sticky'>
            <BlockStyleControls
              editorState={editorState}
              onToggle={this.toggleBlockType}
            />
            <InlineStyleControls
              editorState={editorState}
              onToggle={this.toggleInlineStyle}
            />
            <span>Insync is {this.state.inSync ? 'true' : 'false'}</span>
            {/* <Full
            <button onClick={this.toggleFullWindow} style=</button> */}
          </Sticky>
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onChange}
              onTab={this.onTab}
              placeholder='Write a new bit.'
              ref='editor'
              spellCheck={true}
            />
          </div>
        </StickyContainer>
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    fontFamily: 'monospace',
    fontSize: 16,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'editor-rich-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'editor-rich-styleButton';
    if (this.props.active) {
      className += ' editor-rich-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: 'Large', style: 'header-one' },
  { label: 'Mid', style: 'header-two'},
  { label: 'Small', style: 'header-three' },
  { label: 'Quote', style: 'blockquote' },
  { label: 'List', style: 'unordered-list-item' },
  { label: 'Number List', style: 'ordered-list-item' },
  { label: 'Code', style: 'code-block' },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className='editor-rich-controls'>
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Strikethrough', style: 'STRIKETHROUGH' },
  { label: 'Monospace', style: 'CODE' }
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className='editor-rich-controls'>
      {INLINE_STYLES.map(type =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

export default BitEditor;