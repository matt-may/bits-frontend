import React, { Component } from 'react';
import { Editor, EditorState, ContentState, RichUtils, convertFromRaw, convertToRaw } from 'draft-js';
import { StickyContainer, Sticky } from 'react-sticky';

import constants from '../constants';
import { checkStatus, parseJSON, getFetch, fetchWithTokenAsJson } from '../helpers';

import '../styles/other/draft.css';
import '../styles/other/rich_editor.css';
import '../styles/other/sticky.css';

// Frequency at which to sync the client<->server bit state.
const UPDATE_INTERVAL = 10000;

// var rawData = convertToRaw(editorState.getCurrentContent())
// var contentState = ContentState.createFromBlockArray(Draft.convertFromRaw(rawData))
// var editorState = EditorState.createWithContent(contentState)

class BitEditor extends Component {
  constructor(props) {
    super(props);

    // If we've been given the newBit prop, initialize a property that will tell
    // us whether we've been assigned a bit ID from the server.
    if (this.props.newBit)
      this.bitID = null;
    // If we haven't been told to create a new bit, set this.bitID to the
    // specified pre-existing bitID which was passed in via query params.
    // In this scenario, we are performing an edit of an existing bit, not
    // creating a new one.
    else if (this.props.params)
      this.bitID = this.props.params.bitID;
    // If we haven't been given a newBit prop or a bitID prop, throw an error.
    // This means we're not constructing a new bit, but we're also not editing
    // an existing bit.
    else
      throw new Error('Either the newBit prop or the bitID prop must be ' +
                      'provided.');

    // Initialize our state.
    //
    // `editorState` will contain the representation of editor state.
    // `fullWindow` specifies whether the editor is currently consuming the
    //   full browser window.
    // `inSync` specifies whether the server and client version of the bit
    //   are in sync. Initially this will be true, however it will become
    //   untrue as edits are made locally. Periodic calls to updateBit() will
    //   update this to true.
    this.state = { editorState: EditorState.createEmpty(),
                   fullWindow: false, inSync: true };

    if (this.bitID)
      this.initializeEditorState();

    this.focus = () => this.refs.editor.focus();

    this.onChange = (editorState) => {
      // Update editor state
      this.setState({ editorState, inSync: false });

      // If we haven't been assigned a bit ID and we're not already in the
      // process of creating a new bit, check to see if there's text in the
      // editor, and if so create a new bit.
      if (!this.bitID && !this.creatingBitNow)
        this.potentiallyCreateNewBit(editorState);
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

  // Checks the editor for non-empty text. If some text is found, we set a flag
  // indicating that we're in the process of requesting a bit ID from the server,
  // and we initiate that process.
  potentiallyCreateNewBit(editorState) {
    let editorText = editorState.getCurrentContent().getPlainText();

    if (editorText.length > 0) {
      this.creatingBitNow = true;
      this.createNewBit();
    }
  }

  // Sends a request to our backend to create a new bit. If successful, sets
  // this.bitID to the ID of the newly created bit.
  createNewBit() {
    fetchWithTokenAsJson(constants.BITS_PATH, { method: 'POST' })
    .then(checkStatus)
    .then(parseJSON)
    .then((body) => {
      this.bitID = body.id;
    });
  }

  // On mounting, initiates a setInterval for sending updates to the bit from
  // the client to our backend. By default, we send updates every 10 seconds.
  componentDidMount() {
    this.startUpdateTimer();
  }

  // Clears the update timer on unmount.
  componentWillUnmount() {
    this.clearUpdateTimer();
  }

  startUpdateTimer() {
    this.timerID = setInterval(
      () => this.updateBit(),
      UPDATE_INTERVAL
    );
  }

  clearUpdateTimer() {
    clearInterval(this.timerID);
  }

  initializeEditorState() {
    if (!this.bitID)
      return

    getFetch(constants.BITS_PATH + `/${this.bitID}`)
    .then(checkStatus)
    .then(parseJSON)
    .then((body) => {
      let editorState;

      if (body.js_body) {
        let rawData = JSON.parse(body.js_body);
        let contentState = convertFromRaw(rawData);
        editorState = EditorState.createWithContent(contentState);
      }
      else {
        editorState = EditorState.createEmpty();
      }

      this.setState({ editorState: editorState });
    });
  }

  // Sends a request to our backend to update the bit. If successful, updates
  // inSync in the state to true.
  updateBit() {
    // Return if we have no bit ID to update, or we're already in sync.
    if (!this.bitID) {
      this.setState({ inSync: true })
      return;
    }

    if (this.state.inSync)
      return;

    // Retrieve the editor state.
    let state = this.state.editorState;

    // Post the most recent state of our bit to the server
    fetchWithTokenAsJson(constants.BITS_PATH + `/${this.bitID}`, {
      method: 'PUT',
      body: {
        bit: {
          body: state.getCurrentContent().getPlainText(),
          js_body: JSON.stringify(convertToRaw(state.getCurrentContent())),
        }
      }
    })
    .then(checkStatus)
    .then(() => {
      // Update inSync in our state
      this.setState({ inSync: true });
    });
  }

  forceUpdate = () => {
    this.updateBit();
    this.clearUpdateTimer();
    this.startUpdateTimer();
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
            <button className='button button-outline' onClick={this.toggleFullWindow}>Full</button>
            <button className='button button-outline' onClick={this.forceUpdate}>Save</button>
            <span style={{ float: 'right', marginTop: '5px' }}>
              {this.state.inSync ? 'Saved' : 'Saving...'}
            </span>
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