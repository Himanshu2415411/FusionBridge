function generateProposal(project) {
  const {
    title,
    clientName,
    description,
    techStack = [],
    estimatedBudget,
    estimatedDuration,
    tasks = [],
  } = project;

  const techList =
    techStack.length > 0 ? techStack.join(", ") : "modern technologies";

  const taskList =
    tasks.length > 0
      ? tasks.map((t, i) => `  ${i + 1}. ${t.taskTitle}`).join("\n")
      : "  1. Project setup and configuration\n  2. Core feature development\n  3. Testing and QA\n  4. Deployment and handover";

  const budgetNote =
    estimatedBudget != null
      ? `$${estimatedBudget}`
      : "subject to detailed scoping";

  const timeline = estimatedDuration || "the agreed timeline";

  const proposal = `Dear ${clientName || "Client"},

I am writing to express my strong interest in your project: "${title}".

PROJECT UNDERSTANDING
---------------------
${
    description ||
    "I have thoroughly reviewed your project requirements and am confident in my ability to deliver a high-quality solution that meets your needs."
  }

IMPLEMENTATION PLAN
--------------------
Based on the project scope, here is my proposed implementation approach using ${techList}:

${taskList}

ESTIMATED TIMELINE
------------------
I estimate this project can be completed within ${timeline}, following an agile development process with regular check-ins and milestone updates to keep you informed of progress at every stage.

BUDGET NOTE
-----------
My proposed engagement cost is ${budgetNote}. This covers all development work, code review, testing, and post-delivery support for a smooth handover.

CLOSING
-------
I am committed to delivering clean, maintainable, and well-documented code. I welcome the opportunity to discuss the project in further detail and tailor my approach to your specific needs.

Looking forward to collaborating with you.

Best regards,
[Your Name]`;

  return proposal;
}

module.exports = { generateProposal };
