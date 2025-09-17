import React from "react"
import type { UIField } from 'payload'

import "./index.scss"

const getLabelAsString = (label?: Record<string, string> | string) => {
  return typeof label === "string" ? label : "";
}
async function AgentInput({ field }: { field: UIField }) {
  const label = field?.label;

  return (<div>
    {label && <label>{getLabelAsString(label)}</label>}
    <div>
      <input
        name="query"
        placeholder="Enter the URL of a page to migrate" />
      <button
        type="submit"
      >Migrate</button>
    </div>
  </div>);
}

export default AgentInput
