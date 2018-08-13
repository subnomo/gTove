import * as React from 'react';

import './chatBox.css';

interface Message {
    author: string;
    content: string;
}

interface ChatBoxState {
    messages: Message[];
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

        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.state = {
            messages: []
        };
    }

    handleKeyPress(e: React.KeyboardEvent<any>) {
        // Send chat
        if (e.key === 'Enter') {
            const author = 'sub'; // Test name
            const text: string = (e.target as any).value;
            const message: Message = {
                author,
                content: text,
            };

            // Add to array
            const messages = this.state.messages.concat(message);

            this.setState({
                messages,
            });

            // Clear input
            (e.target as any).value = '';
        }
    }

    render() {
        return (
            <div className='chatBox'>
                <MessageBox {...this.state} />
                <input type='text' name='chatInput' onKeyPress={this.handleKeyPress} />
            </div>
        );
    }
}
