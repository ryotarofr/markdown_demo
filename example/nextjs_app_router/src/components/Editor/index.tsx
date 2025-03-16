"use client"

import React, { forwardRef } from "react";

export const Editor = forwardRef<HTMLTextAreaElement, { defaultValue: string }>(
  ({ defaultValue }, ref) => {
    return (
      <textarea
        ref={ref}
        defaultValue={defaultValue}
        rows={10}
        cols={50}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
    );
  }
);
