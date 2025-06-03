"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Archetype {
  name: string;
  description: string;
  symptoms: string[];
  confidence: number;
  lowScoringQuestions: number[];
  keyPattern: string;
  quickWins: {
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    effort: "High" | "Medium" | "Low";
    timeframe: "Immediate" | "Short-term" | "Medium-term";
  }[];
}

interface HealthCheckData {
  responses: Array<{
    score: number;
    comment: string;
  }>;
  timestamp: string;
  dimensions: {
    Efficiency: number;
    Effectiveness: number;
    Excellence: number;
    "Cross-Dimensional": number;
  };
}

const archetypes: Archetype[] = [
  {
    name: "Shifting the Burden",
    description: "Quick fixes are applied instead of addressing root causes, leading to recurring problems.",
    symptoms: ["quick fix", "temporary solution", "symptom treatment", "dependency"],
    confidence: 0,
    lowScoringQuestions: [1, 4, 9, 13],
    keyPattern: "Quick fixes over root causes; fires reappear",
    quickWins: [
      {
        title: "Root Cause Analysis Workshop",
        description: "Conduct a facilitated workshop to identify and address root causes of recurring issues.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Problem-Solving Framework",
        description: "Implement a structured problem-solving framework (e.g., 5 Whys, Fishbone) for all issues.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Prevention Metrics",
        description: "Track and reward prevention of issues rather than just quick fixes.",
        impact: "Medium",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Erosion of Goals",
    description: "Goals are gradually lowered in response to failure, leading to mediocrity.",
    symptoms: ["lowered standards", "compromised goals", "performance decline", "mediocrity"],
    confidence: 0,
    lowScoringQuestions: [11, 14],
    keyPattern: "Goals lowered over time; standards decay",
    quickWins: [
      {
        title: "Goal Review Process",
        description: "Establish a quarterly goal review process with clear criteria for adjustments.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Success Metrics Dashboard",
        description: "Create a visible dashboard tracking progress against original goals.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Goal-Setting Workshop",
        description: "Facilitate a workshop to reset and recommit to ambitious but achievable goals.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Fixes That Fail",
    description: "Solutions backfire or create new problems, leading to a cycle of fixes.",
    symptoms: ["unintended consequences", "worsening problems", "quick fix", "temporary solution"],
    confidence: 0,
    lowScoringQuestions: [1, 9, 17],
    keyPattern: "Solutions backfire or cause new issues",
    quickWins: [
      {
        title: "Impact Assessment Template",
        description: "Create a template for assessing potential impacts before implementing solutions.",
        impact: "High",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Solution Review Board",
        description: "Establish a cross-functional team to review proposed solutions.",
        impact: "Medium",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Pilot Program Framework",
        description: "Implement a structured approach to piloting solutions before full deployment.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Tragedy of the Commons",
    description: "Shared resources are strained as individuals optimize for their own benefit.",
    symptoms: ["resource strain", "individual optimization", "shared resources", "no ownership"],
    confidence: 0,
    lowScoringQuestions: [18, 19],
    keyPattern: "Shared resources strained; no one feels responsible",
    quickWins: [
      {
        title: "Resource Usage Dashboard",
        description: "Create a transparent dashboard showing resource usage across teams.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Shared Resource Guidelines",
        description: "Develop and communicate clear guidelines for shared resource usage.",
        impact: "High",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Resource Stewardship Program",
        description: "Implement a program to recognize and reward responsible resource usage.",
        impact: "Medium",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Escalation",
    description: "Competition for power or resources creates reinforcing loops of escalation.",
    symptoms: ["competition", "power struggle", "resource conflict", "reinforcing loop"],
    confidence: 0,
    lowScoringQuestions: [2, 5, 7],
    keyPattern: "Competition for power/resources creates reinforcing loops",
    quickWins: [
      {
        title: "Collaboration Framework",
        description: "Establish a framework for cross-team collaboration and resource sharing.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Conflict Resolution Protocol",
        description: "Create and train teams on a clear protocol for resolving resource conflicts.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Shared Success Metrics",
        description: "Develop metrics that reward collaboration and shared success.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Limits to Growth",
    description: "Growth slows as hidden limits are reached, often due to ignored feedback.",
    symptoms: ["plateau", "stagnation", "bottleneck", "ignored feedback"],
    confidence: 0,
    lowScoringQuestions: [12, 15, 16],
    keyPattern: "Growth slows as hidden limits are reached; signals ignored",
    quickWins: [
      {
        title: "Feedback Collection System",
        description: "Implement a structured system for collecting and acting on feedback.",
        impact: "High",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Bottleneck Analysis",
        description: "Conduct a focused analysis of current bottlenecks and constraints.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Growth Metrics Review",
        description: "Review and adjust metrics to better reflect sustainable growth.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      }
    ]
  },
  {
    name: "Success to the Successful",
    description: "Reinforcing loops favor those already succeeding, making it harder for others to catch up.",
    symptoms: ["advantage accumulation", "resource concentration", "struggling to catch up"],
    confidence: 0,
    lowScoringQuestions: [2, 7, 10],
    keyPattern: "Reinforcing loops favor those already succeeding",
    quickWins: [
      {
        title: "Resource Distribution Review",
        description: "Review and adjust resource distribution to ensure fair opportunities.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Mentorship Program",
        description: "Establish a mentorship program to support teams that need help.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Success Criteria Audit",
        description: "Review and adjust success criteria to ensure they're fair and achievable.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Drifting Goals",
    description: "Standards slip as people adapt to lower performance levels.",
    symptoms: ["lowered standards", "performance decline", "goal erosion"],
    confidence: 0,
    lowScoringQuestions: [6, 14, 20],
    keyPattern: "Standards slip as people adapt to lower performance",
    quickWins: [
      {
        title: "Performance Benchmarking",
        description: "Establish clear performance benchmarks and review them regularly.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Goal Tracking System",
        description: "Implement a system to track and visualize goal progress over time.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Standards Review Workshop",
        description: "Conduct a workshop to reset and recommit to high standards.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Growth and Underinvestment",
    description: "Lack of investment in capacity leads to growth limitations.",
    symptoms: ["capacity constraints", "resource scarcity", "growth limitation"],
    confidence: 0,
    lowScoringQuestions: [5, 8, 18],
    keyPattern: "Lack of investment starves long-term capacity",
    quickWins: [
      {
        title: "Capacity Planning Session",
        description: "Conduct a session to identify and plan for capacity needs.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Resource Allocation Review",
        description: "Review and adjust resource allocation to support growth.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Investment Framework",
        description: "Create a framework for evaluating and prioritizing investments.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Attractiveness Principle",
    description: "Focus on what's shiny or urgent, neglecting long-term system health.",
    symptoms: ["short-term focus", "neglected fundamentals", "system decay"],
    confidence: 0,
    lowScoringQuestions: [6, 9, 19],
    keyPattern: "Focus on what's shiny or urgent, neglecting long-term health",
    quickWins: [
      {
        title: "Strategic Planning Session",
        description: "Conduct a session to align short-term actions with long-term goals.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Priority Matrix",
        description: "Implement a matrix to evaluate and prioritize initiatives.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Health Metrics Dashboard",
        description: "Create a dashboard tracking system health indicators.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Accidental Adversaries",
    description: "Well-meaning teams create friction through conflicting actions.",
    symptoms: ["team conflict", "misaligned actions", "unintended friction"],
    confidence: 0,
    lowScoringQuestions: [7, 10, 13],
    keyPattern: "Well-meaning teams create friction through conflicting actions",
    quickWins: [
      {
        title: "Cross-Team Alignment Workshop",
        description: "Facilitate a workshop to align team goals and actions.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Communication Protocol",
        description: "Establish clear protocols for cross-team communication.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Shared Objectives Framework",
        description: "Create a framework for developing shared objectives.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Rule Beating",
    description: "People find workarounds to meet targets, eroding system integrity.",
    symptoms: ["workarounds", "target gaming", "system erosion"],
    confidence: 0,
    lowScoringQuestions: [3, 19, 20],
    keyPattern: "People find workarounds to meet targets",
    quickWins: [
      {
        title: "Process Review",
        description: "Review and simplify processes to reduce need for workarounds.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Metrics Alignment",
        description: "Align metrics with desired behaviors and outcomes.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Feedback Channels",
        description: "Establish channels for reporting process issues.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      }
    ]
  },
  {
    name: "Policy Resistance",
    description: "System pushes back against interventions, making quick fixes ineffective.",
    symptoms: ["resistance", "intervention failure", "system pushback"],
    confidence: 0,
    lowScoringQuestions: [1, 3, 13],
    keyPattern: "System pushes back against interventions",
    quickWins: [
      {
        title: "Stakeholder Analysis",
        description: "Conduct analysis of key stakeholders and their concerns.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Change Management Plan",
        description: "Develop a structured plan for implementing changes.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Feedback Integration",
        description: "Create a system for incorporating feedback into changes.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  },
  {
    name: "Escalation Loop",
    description: "Cycles of one-upmanship create instability in the system.",
    symptoms: ["competition", "instability", "reinforcing cycle"],
    confidence: 0,
    lowScoringQuestions: [5, 7, 17],
    keyPattern: "Cycles of one-upmanship create instability",
    quickWins: [
      {
        title: "Collaboration Framework",
        description: "Establish a framework for collaborative problem-solving.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      },
      {
        title: "Conflict Resolution Training",
        description: "Provide training on constructive conflict resolution.",
        impact: "Medium",
        effort: "Low",
        timeframe: "Immediate"
      },
      {
        title: "Shared Success Metrics",
        description: "Develop metrics that reward collaboration over competition.",
        impact: "High",
        effort: "Medium",
        timeframe: "Short-term"
      }
    ]
  }
];

export default function SystemArchetypesPage() {
  const [healthCheckData, setHealthCheckData] = useState<HealthCheckData | null>(null);
  const [suggestedArchetypes, setSuggestedArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get health check data from localStorage
    const data = localStorage.getItem('healthCheckData');
    if (data) {
      const parsedData = JSON.parse(data);
      setHealthCheckData(parsedData);
      analyzeArchetypes(parsedData);
    }
    setLoading(false);
  }, []);

  const analyzeArchetypes = (data: HealthCheckData) => {
    const { responses } = data;
    // Calculate confidence scores for each archetype
    const analyzedArchetypes = archetypes.map(archetype => {
      let confidence = 0;
      // Check low-scoring questions (score <= 3)
      const lowScoringCount = archetype.lowScoringQuestions.filter(
        questionId => responses[questionId - 1].score <= 3
      ).length;
      // Calculate confidence based on number of low-scoring questions
      confidence = (lowScoringCount / archetype.lowScoringQuestions.length) * 0.7;
      // Add confidence from comments if they contain relevant symptoms
      const comment = responses[archetype.lowScoringQuestions[0] - 1].comment.toLowerCase();
      const symptomMatches = archetype.symptoms.filter(symptom => 
        comment.includes(symptom.toLowerCase())
      ).length;
      confidence += (symptomMatches / archetype.symptoms.length) * 0.3;
      return { ...archetype, confidence, lowScoringCount };
    });
    // Sort by confidence and filter out low confidence matches
    let suggested = analyzedArchetypes
      .filter(archetype => archetype.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence);
    // Fallback: if no archetype detected, pick the one with most low-scoring questions
    if (suggested.length === 0) {
      const maxLow = Math.max(...analyzedArchetypes.map(a => a.lowScoringCount));
      const fallback = analyzedArchetypes.filter(a => a.lowScoringCount === maxLow);
      if (fallback.length > 0) {
        suggested = fallback.slice(0, 1); // pick one
        console.log('[Archetypes] Fallback archetype selected:', suggested[0].name);
      } else {
        console.log('[Archetypes] No fallback archetype found.');
      }
    } else {
      console.log('[Archetypes] Detected archetypes:', suggested.map(a => a.name));
    }
    setSuggestedArchetypes(suggested);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!healthCheckData) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              No health check data found. Please complete the health check assessment first.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Archetypes Analysis</CardTitle>
          <CardDescription>
            Based on your health check responses, we've identified potential system archetypes at play in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {suggestedArchetypes.length > 0 ? (
              suggestedArchetypes.map((archetype) => (
                <div key={archetype.name} className="p-4 border rounded-md bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    {archetype.name}
                    <span className="ml-2 text-sm text-blue-600">
                      (Confidence: {Math.round(archetype.confidence * 100)}%)
                    </span>
                  </h3>
                  <p className="text-blue-700 mb-2">{archetype.description}</p>
                  <div className="text-sm text-blue-600 mb-2">
                    <strong>Key Pattern:</strong> {archetype.keyPattern}
                  </div>
                  <div className="text-sm text-blue-600 mb-4">
                    <strong>Key Symptoms:</strong> {archetype.symptoms.join(", ")}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Quick Wins</h4>
                    <div className="space-y-3">
                      {archetype.quickWins.map((win, index) => (
                        <div key={index} className="p-3 bg-white rounded-md shadow-sm">
                          <div className="font-medium text-blue-700">{win.title}</div>
                          <p className="text-sm text-gray-600 mt-1">{win.description}</p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-green-600">Impact: {win.impact}</span>
                            <span className="text-blue-600">Effort: {win.effort}</span>
                            <span className="text-purple-600">Timeframe: {win.timeframe}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600">
                No clear system archetypes detected. Consider providing more detailed responses in the health check.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 