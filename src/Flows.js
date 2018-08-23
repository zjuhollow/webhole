import React, {Component} from 'react';
import {ColorPicker} from './color_picker';
import {Time, TitleLine, HighlightedText} from './Common.js';
import './Flows.css';
import LazyLoad from 'react-lazyload';
import {AudioWidget} from './AudioWidget.js';

const IMAGE_BASE='http://www.pkuhelper.com/services/pkuhole/images/';
const AUDIO_BASE='/audio_proxy/';
const API_BASE=window.location.protocol==='https:' ? '/api_proxy' : 'http://www.pkuhelper.com:10301/services/pkuhole';

const SEARCH_PAGESIZE=50;
const CLICKABLE_TAGS={a: true, audio: true};
const PREVIEW_REPLY_COUNT=10;

window.LATEST_POST_ID=parseInt(localStorage['_LATEST_POST_ID'],10)||0;

function Reply(props) {
    return (
        <div className={'flow-reply box'} style={props.info._display_color ? {
            backgroundColor: props.info._display_color,
        } : null}>
            <div className="box-header">
                <span className="box-id">#{props.info.cid}</span>&nbsp;
                <Time stamp={props.info.timestamp} />
            </div>
            <HighlightedText text={props.info.text} color_picker={props.color_picker} />
        </div>
    );
}

function FlowItem(props) {
    return (
        <div className="flow-item box">
            {parseInt(props.info.pid,10)>window.LATEST_POST_ID && <div className="flow-item-dot" /> }
            <div className="box-header">
                {!!parseInt(props.info.likenum,10) && <span className="box-header-badge">{props.info.likenum}★</span>}
                {!!parseInt(props.info.reply,10) && <span className="box-header-badge">{props.info.reply}回复</span>}
                <span className="box-id">#{props.info.pid}</span>&nbsp;
                <Time stamp={props.info.timestamp} />
            </div>
            <HighlightedText text={props.info.text} color_picker={props.color_picker} />
            {props.info.type==='image' ? <p className="img"><img src={IMAGE_BASE+props.info.url} /></p> : null}
            {props.info.type==='audio' ? <AudioWidget src={AUDIO_BASE+props.info.url} /> : null}
        </div>
    );
}

class FlowItemRow extends Component {
    constructor(props) {
        super(props);
        this.state={
            replies: [],
            reply_status: 'done',
            info: props.info,
        };
        this.color_picker=new ColorPicker();
    }

    componentDidMount() {
        if(parseInt(this.state.info.reply,10)) {
            this.load_replies();
        }
    }

    load_replies(callback) {
        console.log('fetching reply',this.state.info.pid);
        this.setState({
            reply_status: 'loading',
        });
        fetch(API_BASE+'/api.php?action=getcomment&pid='+this.state.info.pid)
            .then((res)=>res.json())
            .then((json)=>{
                if(json.code!==0)
                    throw new Error(json.code);
                const replies=json.data
                    .sort((a,b)=>{
                        return parseInt(a.timestamp,10)-parseInt(b.timestamp,10);
                    })
                    .map((info)=>{
                        info._display_color=this.color_picker.get(info.name);
                        return info;
                    });
                this.setState((prev,props)=>({
                    replies: replies,
                    info: Object.assign({}, prev.info, {
                        reply: ''+replies.length,
                    }),
                    reply_status: 'done',
                }),callback);
            })
            .catch((e)=>{
                console.trace(e);
                this.setState({
                    replies: [],
                    reply_status: 'failed',
                },callback);
            });
    }

    show_sidebar() {
        this.props.callback(
            '帖子详情',
            <div className="flow-item-row sidebar-flow-item">
                <div className="box box-tip">
                    <a onClick={()=>{
                        this.props.callback('帖子详情',<p className="box box-tip">加载中……</p>);
                        this.load_replies(this.show_sidebar);
                    }}>更新回复</a>
                </div>
                <FlowItem info={this.state.info} color_picker={this.color_picker} />
                {this.state.replies.map((reply)=>(
                    <LazyLoad offset={500} height="5em" overflow={true} once={true}>
                        <Reply key={reply.cid} info={reply} color_picker={this.color_picker} />
                    </LazyLoad>
                ))}
            </div>
        );
    }

    render() {
        // props.do_show_details
        return (
            <div className="flow-item-row" onClick={(event)=>{
                if(!CLICKABLE_TAGS[event.target.tagName.toLowerCase()])
                    this.show_sidebar();
            }}>
                <FlowItem info={this.state.info} color_picker={this.color_picker} />
                <div className="flow-reply-row">
                    {this.state.reply_status==='loading' && <div className="box box-tip">加载中</div>}
                    {this.state.reply_status==='failed' &&
                        <div className="box box-tip"><a onClick={()=>{this.load_replies()}}>重新加载</a></div>
                    }
                    {this.state.replies.slice(0,PREVIEW_REPLY_COUNT).map((reply)=>(
                        <Reply key={reply.cid} info={reply} color_picker={this.color_picker} />
                    ))}
                    {this.state.replies.length>PREVIEW_REPLY_COUNT &&
                        <div className="box box-tip">还有 {this.state.replies.length-PREVIEW_REPLY_COUNT} 条</div>
                    }
                </div>
            </div>
        );
    }
}

function FlowChunk(props) {
    return (
        <div className="flow-chunk">
            <TitleLine text={props.title} />
            {props.list.map((info)=>(
                <LazyLoad key={info.pid} offset={500} height="15em" once={true} >
                    <FlowItemRow info={info} callback={props.callback} />
                </LazyLoad>
            ))}
        </div>
    );
}

export class Flow extends Component {
    constructor(props) {
        super(props);
        this.state={
            mode: (
                props.search_text===null ? 'list' :
                props.search_text.charAt(0)==='#' ? 'single' :
                'search'
            ),
            search_param: props.search_text,
            loaded_pages: 0,
            chunks: [],
            loading_status: 'done',
        };
        this.on_scroll_bound=this.on_scroll.bind(this);
        window.LATEST_POST_ID=parseInt(localStorage['_LATEST_POST_ID'],10)||0;
    }

    load_page(page) {
        if(page>this.state.loaded_pages+1)
            throw new Error('bad page');
        if(page===this.state.loaded_pages+1) {
            console.log('fetching page',page);
            if(this.state.mode==='list') {
                fetch(API_BASE+'/api.php?action=getlist&p='+page)
                    .then((res)=>res.json())
                    .then((json)=>{
                        if(json.code!==0)
                            throw new Error(json.code);
                        json.data.forEach((x)=>{
                            if(parseInt(x.pid,10)>(parseInt(localStorage['_LATEST_POST_ID'],10)||0))
                                localStorage['_LATEST_POST_ID']=x.pid;
                        });
                        this.setState((prev,props)=>({
                            chunks: prev.chunks.concat([{
                                title: 'Page '+page,
                                data: json.data.filter((x)=>(
                                    prev.chunks.length===0 ||
                                    !(prev.chunks[prev.chunks.length-1].data.some((p)=>p.pid===x.pid))
                                )),
                            }]),
                            loading_status: 'done',
                        }));
                    })
                    .catch((err)=>{
                        console.trace(err);
                        this.setState((prev,props)=>({
                            loaded_pages: prev.loaded_pages-1,
                            loading_status: 'failed',
                        }));
                    });
            } else if(this.state.mode==='search') {
                fetch(
                    API_BASE+'/api.php?action=search'+
                    '&pagesize='+SEARCH_PAGESIZE*page+
                    '&keywords='+encodeURIComponent(this.state.search_param)
                )
                    .then((res)=>res.json())
                    .then((json)=>{
                        if(json.code!==0)
                            throw new Error(json.code);
                        const finished=json.data.length<SEARCH_PAGESIZE;
                        this.setState({
                            chunks: [{
                                title: 'Result for "'+this.state.search_param+'"',
                                data: json.data,
                                mode: finished ? 'search_finished' : 'search',
                            }],
                            loading_status: 'done',
                        });
                    })
                    .catch((err)=>{
                        console.trace(err);
                        this.setState((prev,props)=>({
                            loaded_pages: prev.loaded_pages-1,
                            loading_status: 'failed',
                        }));
                    });
            } else if(this.state.mode==='single') {
                const pid=parseInt(this.state.search_param.substr(1),10);
                fetch(
                    API_BASE+'/api.php?action=getone'+
                    '&pid='+pid
                )
                    .then((res)=>res.json())
                    .then((json)=>{
                        if(json.code!==0)
                            throw new Error(json.code);
                        this.setState({
                            chunks: [{
                                title: 'PID = '+pid,
                                data: [json.data],
                            }],
                            mode: 'single_finished',
                            loading_status: 'done',
                        });
                    })
                    .catch((err)=>{
                        console.trace(err);
                        this.setState((prev,props)=>({
                            loaded_pages: prev.loaded_pages-1,
                            loading_status: 'failed',
                        }));
                    });
            } else {
                console.log('nothing to load');
                return;
            }

            this.setState((prev,props)=>({
                loaded_pages: prev.loaded_pages+1,
                loading_status: 'loading',
            }));
        }
    }

    on_scroll(event) {
        if(event.target===document) {
            const avail=document.body.scrollHeight-window.scrollY-window.innerHeight;
            if(avail<window.innerHeight && this.state.loading_status==='done')
                this.load_page(this.state.loaded_pages+1);
        }
    }

    componentDidMount() {
        this.load_page(1);
        window.addEventListener('scroll',this.on_scroll_bound);
        window.addEventListener('resize',this.on_scroll_bound);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll',this.on_scroll_bound);
        window.removeEventListener('resize',this.on_scroll_bound);
    }

    render() {
        return (
            <div className="flow-container">
                {this.state.chunks.map((chunk)=>(
                    <FlowChunk title={chunk.title} list={chunk.data} key={chunk.title} callback={this.props.callback} />
                ))}
                {this.state.loading_status==='failed' &&
                    <div className="box box-tip">
                        <a onClick={()=>{this.load_page(this.state.loaded_pages+1)}}>重新加载</a>
                    </div>
                }
                <TitleLine text={this.state.loading_status==='loading' ? 'Loading...' : '© xmcp'} />
            </div>
        );
    }
}