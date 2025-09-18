'use client'

import React, { useState } from "react"
import type { Payload, UIField } from "payload"
import axios from "axios"

const getLabelAsString = (label?: Record<string, string> | string) => {
  return typeof label === "string" ? label : "";
};

function AgentInputClient({ field }: {
  field?: UIField
}) {
  const label = field?.label;

  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    axios.post("/api/jobs", {
      task: "migratePage",
      data: { url },
    }).then((response) => {
      console.log("Job created:", response.data);
    }).catch((error) => {
      console.error("Error creating job:", error);
    })
  };


  return (<div>
    {label && <label htmlFor="inputMigratePageUrl">{getLabelAsString(label)}</label>}
    <div>
      <input
        id="inputMigratePageUrl"
        placeholder="Enter the URL of a page to migrate"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        type="submit"
        onClick={handleSubmit}
      >Migrate</button>
    </div>
  </div>);
}

export default AgentInputClient
