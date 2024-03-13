import { API_BASE } from "@/utils/api";
import { ABORT_STREAM_EVENT } from "@/utils/chat";
import { baseHeaders } from "@/utils/request";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { v4 } from "uuid";

const WorkspaceThread = {
  all: async function (workspaceSlug) {
    const { threads } = await fetch(
      `${API_BASE()}/workspace/${workspaceSlug}/threads`,
      {
        method: "GET",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return { threads: [] };
      });

    return { threads };
  },
  new: async function (workspaceSlug) {
    const { thread, error } = await fetch(
      `${API_BASE()}/workspace/${workspaceSlug}/thread/new`,
      {
        method: "POST",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return { thread: null, error: e.message };
      });

    return { thread, error };
  },
  update: async function (workspaceSlug, threadSlug, data = {}) {
    const { thread, message } = await fetch(
      `${API_BASE()}/workspace/${workspaceSlug}/thread/${threadSlug}/update`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return { thread: null, message: e.message };
      });

    return { thread, message };
  },
  delete: async function (workspaceSlug, threadSlug) {
    return await fetch(
      `${API_BASE()}/workspace/${workspaceSlug}/thread/${threadSlug}`,
      {
        method: "DELETE",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.ok)
      .catch(() => false);
  },
  chatHistory: async function (workspaceSlug, threadSlug) {
    const history = await fetch(
      `${API_BASE()}/workspace/${workspaceSlug}/thread/${threadSlug}/chats`,
      {
        method: "GET",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .then((res) => res.history || [])
      .catch(() => []);
    return history;
  },
  streamChat: async function (
    { workspaceSlug, threadSlug },
    message,
    handleChat
  ) {
    const ctrl = new AbortController();

    // Listen for the ABORT_STREAM_EVENT key to be emitted by the client
    // to early abort the streaming response. On abort we send a special `stopGeneration`
    // event to be handled which resets the UI for us to be able to send another message.
    // The backend response abort handling is done in each LLM's handleStreamResponse.
    window.addEventListener(ABORT_STREAM_EVENT, () => {
      ctrl.abort();
      handleChat({ id: v4(), type: "stopGeneration" });
    });

    await fetchEventSource(
      `${API_BASE()}/workspace/${workspaceSlug}/thread/${threadSlug}/stream-chat`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: baseHeaders(),
        signal: ctrl.signal,
        openWhenHidden: true,
        async onopen(response) {
          if (response.ok) {
            return; // everything's good
          } else if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            handleChat({
              id: v4(),
              type: "abort",
              textResponse: null,
              sources: [],
              close: true,
              error: `An error occurred while streaming response. Code ${response.status}`,
            });
            ctrl.abort();
            throw new Error("Invalid Status code response.");
          } else {
            handleChat({
              id: v4(),
              type: "abort",
              textResponse: null,
              sources: [],
              close: true,
              error: `An error occurred while streaming response. Unknown Error.`,
            });
            ctrl.abort();
            throw new Error("Unknown error");
          }
        },
        async onmessage(msg) {
          try {
            const chatResult = JSON.parse(msg.data);
            handleChat(chatResult);
          } catch {}
        },
        onerror(err) {
          handleChat({
            id: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. ${err.message}`,
          });
          ctrl.abort();
          throw new Error();
        },
      }
    );
  },
};

export default WorkspaceThread;
