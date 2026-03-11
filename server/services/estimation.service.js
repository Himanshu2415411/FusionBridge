function estimateProject(project) {
  const { title = "", description = "", techStack = [], estimatedBudget } = project;

  const combined = `${title} ${description} ${techStack.join(" ")}`.toLowerCase();

  // Determine project type and base duration
  let estimatedDuration;
  if (
    combined.includes("fullstack") ||
    combined.includes("full stack") ||
    combined.includes("full-stack") ||
    (combined.includes("frontend") && combined.includes("backend"))
  ) {
    estimatedDuration = "4 weeks";
  } else if (
    combined.includes("backend") ||
    combined.includes("api") ||
    combined.includes("server") ||
    combined.includes("database")
  ) {
    estimatedDuration = "3 weeks";
  } else {
    // Default: frontend / UI / design projects
    estimatedDuration = "2 weeks";
  }

  // Determine budget estimate
  let budget;
  if (estimatedBudget != null) {
    budget = estimatedBudget;
  } else {
    const taskCount = (project.tasks || []).length;
    if (taskCount >= 6 || combined.includes("complex") || combined.includes("enterprise")) {
      budget = 3000;
    } else if (taskCount >= 3 || combined.includes("medium") || combined.includes("fullstack") || combined.includes("full stack")) {
      budget = 1500;
    } else {
      budget = 500;
    }
  }

  return {
    estimatedDuration,
    estimatedBudget: budget,
  };
}

module.exports = { estimateProject };
