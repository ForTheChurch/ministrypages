'use client'

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { Payload, UIField } from "payload"
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import axios from "axios"
import Modal from "./modal"

const getLabelAsString = (label?: Record<string, string> | string) => {
  return typeof label === "string" ? label : "";
};


const reloadPage = () => {
  window.location.reload();
};

const navigate = (url: string) => {
  window.location.href = url;

}

const createModal = () => {
  const onClickGoToPages = () => {
    navigate("/admin/collections/pages");
  };

  const onClickCancelTask = () => {

  };

  return createPortal(
    <Modal>
      <p>A conversion is in progress. This page will automatically refresh when the task is complete.</p>
      <button onClick={onClickGoToPages}>Go to Pages</button>
      <button onClick={onClickCancelTask}>Cancel Task</button>
    </Modal>,
    document.body
  );
}

const isAgentTaskActive = (agentTask) => {
  const agentTaskStatus = agentTask?.agentTaskStatus;
  return (agentTaskStatus == "queued") || (agentTaskStatus == "running");
}

function ConvertSinglePageClient({ field }: { field?: UIField }) {
  const label = field?.label;

  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [activeTask, setActiveTask] = useState({});

  const { id } = useDocumentInfo();
  const documentId = id;

  // TODO: Make this more robust
  //  - Handle dirty form
  //  - Handle existing conversion task
  //  - Better error handling
  const handleSubmit = async () => {
    axios.post("/api/single-page-conversion-tasks", {
      workflow: "convertSinglePage",
      data: { documentId, url },
    }).then((response) => {
      console.log("Job created:", response.data);
      reloadPage();
    }).catch((error) => {
      console.error("Error creating job:", error);
    })
  };

  const getActiveConversionTask = async () => {
    try {
      const result = await axios.get(`/api/single-page-conversion-tasks/${documentId}`);
      const { doc } = result.data;
      return doc;
    } catch (error) {
      if (error.status == 404) {
        return null;
      }
    }
  }

  // Update the mounted status
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Get the initial activeTaskId
  useEffect(() => {
    getActiveConversionTask().then(task => setActiveTask(task));
  }, []);


  // Poll once every second for conversion complete and then reload
  useEffect(() => {
    if (!isAgentTaskActive(activeTask)) return;

    let intervalId = setInterval(async () => {
      const conversionTask = await getActiveConversionTask();
      setActiveTask(conversionTask);
      console.log("[ConvertSinglePageClient] Updated conversionTask: ", conversionTask?.agentTaskStatus);
      if (!isAgentTaskActive(conversionTask)) {
        clearInterval(intervalId);
        reloadPage();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeTask]);


  return (<>
    {mounted && isAgentTaskActive(activeTask) && createModal()}
    <div>
      {label && <label htmlFor="inputConversionPageUrl">{getLabelAsString(label)}</label>}
      <div>
        <input
          id="inputConversionPageUrl"
          placeholder="Enter the URL of a page to convert"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSubmit}
        >Migrate</button>
      </div>
      <div>
        <span>Task status:</span>
        <span>{activeTask?.agentTaskStatus || "No task running"}</span>
      </div>
    </div>
  </>
  );
}

export default ConvertSinglePageClient
