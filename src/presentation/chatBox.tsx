import * as React from 'react';
import Select from 'react-select';
import * as parse from 'csv-parse';
import 'whatwg-fetch';

import './chatBox.css';

// Async parse function
function aparse(csv: string): any {
    return new Promise<any>((resolve, reject) => {
        parse(csv, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

interface Message {
    author: string;
    content: any;
}

interface ChatBoxState {
    messages: Message[];
    selectValue: any;
    inputValue: string;
    options: any[];
}

interface MessageBoxState {
    messages: Message[];
}

class MessageBox extends React.Component<ChatBoxState, MessageBoxState> {
    private el: HTMLDivElement | null;

    constructor(props: ChatBoxState) {
        super(props);

        this.scrollBottom = this.scrollBottom.bind(this);

        this.state = {
            messages: props.messages,
        };
    }

    componentDidUpdate(prevProps: ChatBoxState) {
        // Scroll to bottom with new message
        if (this.props.messages.length !== prevProps.messages.length) {
            this.scrollBottom();
        }
    }

    scrollBottom() {
        if (this.el === null) return;

        this.el.scrollIntoView({ behavior: 'smooth' });
    }

    render() {
        return (
            <div className='messages'>
                {this.props.messages.map((msg, i) => (
                    <span key={i}><b>{msg.author}:</b> {msg.content}</span>
                ))}

                {/* Empty div to scroll to */}
                <div ref={el => { this.el = el; }} />
            </div>
        );
    }
}

export default class ChatBox extends React.Component<any, ChatBoxState> {
    constructor(props: any) {
        super(props);

        this.readMacros = this.readMacros.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputKeyDown = this.handleInputKeyDown.bind(this);

        this.state = {
            messages: [],
            selectValue: '',
            inputValue: '',
            options: [],
        };

        // Fetch macros
        this.readMacros().catch((e) => {
            console.error('Error reading macros: ' + e);
        });
    }

    async readMacros() {
        // TODO: Temporary URL, will need to fetch from Google Drive
        const res = await fetch('https://cors-anywhere.herokuapp.com/https://transfer.sh/UlNFb/macros.csv',
            { headers: {'X-Requested-With': 'https://github.com/RobRendell/gTove'}
        });

        const csv = await res.text();
        const macros: string[][] = await aparse(csv);

        const options = macros.slice(1).map((spell, i) => {
            if (spell[1] !== 'url') return;

            return {
                value: <a target='_blank' href={spell[3]}>{spell[0]}</a>,
                label: spell[0],
            };
        });

        this.setState({
            options: options.filter(el => el !== undefined),
        })
    }

    handleChange(value: any) {
        if (!value) return;

        const author = 'sub'; // Test name
        const message: Message = {
            author,
            content: value.value,
        };

        // Add to array and clear input
        const messages = this.state.messages.concat(message);

        this.setState({
            messages,
            inputValue: '',
            selectValue: this.state.selectValue === '' ? null : '', // Hack
        });
    }

    handleInputChange(value: string): string {
        this.setState({
            inputValue: value,
        });

        return value;
    }

    handleInputKeyDown(e: React.KeyboardEvent<any>) {
        const { inputValue, selectValue, messages } = this.state;

        // Send chat
        if (e.key === 'Enter') {
            e.preventDefault();

            const author = 'sub'; // Test name
            const message: Message = {
                author,
                content: inputValue,
            };

            // Add to array and clear input
            this.setState({
                messages: messages.concat(message),
                selectValue: selectValue === '' ? null : '', // Hack
                inputValue: '',
            });
        }
    }

    render() {
        return (
            <div className='chatBox'>
                <MessageBox {...this.state} />
                <Select
                    options={this.state.options}
                    value={this.state.selectValue}
                    className='chatSelect'
                    arrowRenderer={null}
                    onChange={this.handleChange}
                    onInputKeyDown={this.handleInputKeyDown}
                    onInputChange={this.handleInputChange}
                    onBlurResetsInput={false}
                    onCloseResetsInput={false}
                />
            </div>
        );
    }
}
