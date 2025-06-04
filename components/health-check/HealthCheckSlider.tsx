import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface HealthCheckSliderProps {
  currentResponse: { score: number; comment: string; answered: boolean };
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
}

const SCALE_OPTIONS = [
  { 
    value: 1, 
    label: "Strongly Disagree", 
    color: "border-red-500 hover:bg-red-50 hover:border-red-600", 
    bgColor: "bg-red-500" 
  },
  { 
    value: 2, 
    label: "Disagree", 
    color: "border-orange-500 hover:bg-orange-50 hover:border-orange-600", 
    bgColor: "bg-orange-500" 
  },
  { 
    value: 3, 
    label: "Neutral", 
    color: "border-yellow-500 hover:bg-yellow-50 hover:border-yellow-600", 
    bgColor: "bg-yellow-500" 
  },
  { 
    value: 4, 
    label: "Agree", 
    color: "border-blue-500 hover:bg-blue-50 hover:border-blue-600", 
    bgColor: "bg-blue-500" 
  },
  { 
    value: 5, 
    label: "Strongly Agree", 
    color: "border-green-500 hover:bg-green-50 hover:border-green-600", 
    bgColor: "bg-green-500" 
  }
];

export default function HealthCheckSlider({ currentResponse, onScoreChange, onCommentChange }: HealthCheckSliderProps) {
  return (
    <div className="space-y-6">
      {/* Fixed Height Container for Rating */}
      <div className="min-h-[160px]">
        <Label className="text-base font-medium block mb-4">
          Rate your agreement with this statement:
        </Label>
        
        {/* Horizontal Card Selection */}
        <div className="grid grid-cols-5 gap-3">
          {SCALE_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all transform hover:scale-105 border-2 ${
                currentResponse.score === option.value 
                  ? `${option.color} shadow-lg` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onScoreChange(option.value)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                  currentResponse.score === option.value ? option.bgColor : 'bg-gray-400'
                }`}>
                  {option.value}
                </div>
                <div className="text-sm font-medium leading-tight">
                  {option.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Option Confirmation */}
        {currentResponse.score > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 text-center">
              <span className="font-semibold">Selected:</span> {SCALE_OPTIONS.find(s => s.value === currentResponse.score)?.label}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Height Container for Comments */}
      <div className="min-h-[120px]">
        <Label htmlFor="comment" className="text-base font-medium block mb-2">
          Additional Comments <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <Textarea
          id="comment"
          value={currentResponse.comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Share specific examples or context..."
          className="h-20 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
} 