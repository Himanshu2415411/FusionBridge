function generateContract(project) {
  const {
    title,
    clientName,
    description,
    techStack = [],
    estimatedBudget,
    estimatedDuration,
    tasks = [],
  } = project;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const techList = techStack.length > 0 ? techStack.join(", ") : "as agreed";

  const scopeItems =
    tasks.length > 0
      ? tasks.map((t, i) => `  ${i + 1}. ${t.taskTitle}`).join("\n")
      : "  1. Requirements gathering and planning\n  2. Development and implementation\n  3. Testing and quality assurance\n  4. Delivery and handover";

  const budgetNote =
    estimatedBudget != null ? `$${estimatedBudget}` : "as mutually agreed";

  const timeline = estimatedDuration || "as mutually agreed";

  const contract = `FREELANCE DEVELOPMENT AGREEMENT
================================
Date: ${today}

1. PARTIES
----------
This agreement is entered into between:

  Freelancer: [Your Full Name] ("Developer")
  Client:     ${clientName || "[Client Name]"} ("Client")

Both parties agree to the following terms and conditions for the project described herein.

2. PROJECT DESCRIPTION
----------------------
Project Title: ${title}

${description || "The Developer agrees to complete the project as discussed and scoped between both parties."}

Technologies to be used: ${techList}

3. SCOPE OF WORK
----------------
The Developer will deliver the following:

${scopeItems}

Any work beyond the agreed scope will require a written amendment to this agreement.

4. TIMELINE
-----------
The estimated project duration is ${timeline}, commencing from the date this agreement is signed. Milestones and delivery dates will be communicated at the start of the project. Delays caused by the Client (e.g., late feedback or asset delivery) will not count against the Developer's timeline.

5. PAYMENT TERMS
----------------
Total Project Fee: ${budgetNote}

  - 50% deposit due before work begins.
  - Remaining 50% due upon final delivery and Client approval.

Payments are non-refundable once the corresponding phase of work has been completed.

6. DELIVERY EXPECTATIONS
------------------------
  - The Developer will provide the final deliverables in the formats agreed upon.
  - The Client will be given up to 2 rounds of revisions within the agreed scope.
  - Final source code and assets will be transferred to the Client upon receipt of full payment.
  - The Developer retains the right to display the work in their portfolio unless otherwise agreed in writing.

By proceeding with this project, both parties acknowledge they have read and agree to the terms of this agreement.

________________________________          ________________________________
Developer Signature & Date                Client Signature & Date
`;

  return contract;
}

module.exports = { generateContract };
