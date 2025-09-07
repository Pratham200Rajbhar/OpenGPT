import React, { useState } from 'react';
import { ChatProvider } from './contexts/ChatContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import "katex/dist/katex.min.css";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <SupabaseProvider>
      <ChatProvider>
        <div className="flex h-screen bg-gray-950 text-white">
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
          <ChatArea sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
        </div>
      </ChatProvider>
    </SupabaseProvider>
  );
}

export default App;
