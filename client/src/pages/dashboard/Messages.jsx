import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Send, MessageSquare } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import messageService from '../../services/messageService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get('to') || null);
  const [thread, setThread] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    document.title = 'Messages | Haven Realty';
    loadConversations();
  }, []);

  const loadConversations = () => {
    setLoadingConversations(true);
    messageService
      .getConversations()
      .then((res) => setConversations(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoadingConversations(false));
  };

  useEffect(() => {
    if (!selectedUserId) return;
    setLoadingThread(true);
    messageService
      .getConversationWithUser(selectedUserId)
      .then((res) => setThread(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoadingThread(false));
  }, [selectedUserId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    setSending(true);
    try {
      const res = await messageService.sendMessage({ recipientId: selectedUserId, body: messageText.trim() });
      setThread((prev) => [...prev, res.data]);
      setMessageText('');
      loadConversations();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find((c) => String(c.user._id) === String(selectedUserId));

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Messages</h1>
      <p className="mt-1 text-sm text-slate-500">Direct conversations with agents and property owners</p>

      <div className="card mt-6 grid grid-cols-1 overflow-hidden md:grid-cols-3">
        <div className="border-r border-gray-100 md:col-span-1">
          {loadingConversations ? (
            <LoadingSpinner label="Loading conversations" />
          ) : conversations.length === 0 && !selectedUserId ? (
            <EmptyState icon={MessageSquare} title="No conversations yet" description="Messages from agents will appear here." />
          ) : (
            <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto">
              {conversations.map((conversation) => (
                <li key={conversation.user._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(conversation.user._id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                      String(selectedUserId) === String(conversation.user._id) ? 'bg-navy-50' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-100 font-semibold text-navy-700">
                      {conversation.user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">{conversation.user.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{conversation.lastMessage?.body}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col md:col-span-2">
          {!selectedUserId ? (
            <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-400">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-navy-900">
                  {selectedConversation?.user.fullName || 'Conversation'}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: '50vh' }}>
                {loadingThread ? (
                  <LoadingSpinner label="Loading messages" />
                ) : thread.length === 0 ? (
                  <p className="text-center text-sm text-slate-400">Say hello to start the conversation</p>
                ) : (
                  thread.map((msg) => {
                    const isMine = String(msg.sender._id) === String(user._id);
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-xl px-3.5 py-2 text-sm ${
                            isMine ? 'bg-navy-800 text-white' : 'bg-gray-100 text-slate-700'
                          }`}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" disabled={sending} className="btn-primary" aria-label="Send message">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
