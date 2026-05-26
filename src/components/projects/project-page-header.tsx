"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "./project-form";

export function ProjectPageHeader() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">プロジェクト</h1>
      <Button onClick={() => setShowForm(true)}>
        <Plus className="mr-2 h-4 w-4" />
        新規プロジェクト
      </Button>
      <ProjectForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
