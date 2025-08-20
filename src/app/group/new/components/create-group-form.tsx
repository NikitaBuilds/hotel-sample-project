"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Calendar as CalendarIconSmall,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateGroup } from "@/services/group/management";
import type { CreateGroupRequest } from "@/services/group/management/types";

const STEPS = [
  {
    title: "Trip Details",
    description: "Name your trip and add a description",
  },
  { title: "Dates", description: "When are you planning to ski?" },
  { title: "Group Size", description: "How many friends are joining?" },
  { title: "Invite Friends", description: "Add your friends' emails" },
  { title: "Review", description: "Double-check everything looks good" },
];

interface FormData {
  name: string;
  description: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  maxMembers: number;
  inviteEmails: string[];
}

export function CreateGroupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    checkInDate: undefined,
    checkOutDate: undefined,
    maxMembers: 5,
    inviteEmails: Array(5).fill(""),
  });

  const createGroupMutation = useCreateGroup();

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...updates };
      // Update invite emails array size when maxMembers changes
      if (updates.maxMembers && updates.maxMembers !== prev.maxMembers) {
        newData.inviteEmails = Array(updates.maxMembers - 1)
          .fill("")
          .map((_, index) => prev.inviteEmails[index] || "");
      }
      return newData;
    });
  };

  const updateInviteEmail = (index: number, email: string) => {
    const newEmails = [...formData.inviteEmails];
    newEmails[index] = email;
    setFormData((prev) => ({ ...prev, inviteEmails: newEmails }));
  };

  const handleSubmit = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) return;

    const validEmails = formData.inviteEmails.filter(
      (email) => email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    );

    const groupData: CreateGroupRequest = {
      name: formData.name,
      description: formData.description,
      check_in_date: formData.checkInDate.toISOString().split("T")[0],
      check_out_date: formData.checkOutDate.toISOString().split("T")[0],
      max_members: formData.maxMembers,
      invite_emails: validEmails.length > 0 ? validEmails : undefined,
    };

    try {
      const result = await createGroupMutation.mutateAsync(groupData);
      if (result.success && result.data) {
        router.push(`/dashboard`);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.checkInDate && formData.checkOutDate;
      case 3:
        return formData.maxMembers >= 2 && formData.maxMembers <= 20;
      case 4:
        return true; // Optional step - emails can be empty
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceed) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      {/* Stepper at Top */}
      <div className="mb-8">
        <Stepper value={currentStep} onValueChange={setCurrentStep}>
          <StepperNav className="gap-3.5">
            {STEPS.map((step, index) => (
              <StepperItem
                key={index}
                step={index + 1}
                className="relative flex-1 items-start"
              >
                <StepperTrigger className="flex flex-col items-start justify-center gap-3.5 grow">
                  <StepperIndicator className="bg-border rounded-full h-1 w-full data-[state=active]:bg-primary data-[state=completed]:bg-primary"></StepperIndicator>
                  <div className="flex flex-col items-start gap-1">
                    <StepperTitle className="text-start font-semibold group-data-[state=inactive]/step:text-muted-foreground">
                      {step.title}
                    </StepperTitle>
                  </div>
                </StepperTrigger>
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      {/* Form Content in Middle */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <Stepper value={currentStep} onValueChange={setCurrentStep}>
            <StepperPanel className="text-sm">
              {/* Step 1: Trip Details */}
              <StepperContent value={1} className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Trip Details</h2>
                  <p className="text-muted-foreground">
                    Name your trip and add a description
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Trip Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Epic Ski Weekend 2025"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell your friends what this trip is about..."
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData({ description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </StepperContent>

              {/* Step 2: Dates */}
              <StepperContent value={2} className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Dates</h2>
                  <p className="text-muted-foreground">
                    When are you planning to ski?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can change this later
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkInDate
                            ? format(formData.checkInDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.checkInDate}
                          onSelect={(date) =>
                            updateFormData({ checkInDate: date })
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.checkOutDate
                            ? format(formData.checkOutDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.checkOutDate}
                          onSelect={(date) =>
                            updateFormData({ checkOutDate: date })
                          }
                          disabled={(date) =>
                            !formData.checkInDate ||
                            date <= formData.checkInDate
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {formData.checkInDate && formData.checkOutDate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Trip duration:{" "}
                      {Math.ceil(
                        (formData.checkOutDate.getTime() -
                          formData.checkInDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                )}
              </StepperContent>

              {/* Step 3: Group Size */}
              <StepperContent value={3} className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Group Size</h2>
                  <p className="text-muted-foreground">
                    How many friends are joining?
                  </p>
                </div>
                <div className="space-y-4">
                  <Label>Maximum Group Size *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[2, 3, 4, 5, 6, 8, 10, 12].map((size) => (
                      <Button
                        key={size}
                        variant={
                          formData.maxMembers === size ? "default" : "outline"
                        }
                        className="h-12"
                        onClick={() => updateFormData({ maxMembers: size })}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {size}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="custom-size" className="text-sm">
                      Custom:
                    </Label>
                    <Input
                      id="custom-size"
                      type="number"
                      min="2"
                      max="20"
                      className="w-20"
                      value={formData.maxMembers}
                      onChange={(e) =>
                        updateFormData({
                          maxMembers: parseInt(e.target.value) || 2,
                        })
                      }
                    />
                  </div>
                </div>
              </StepperContent>

              {/* Step 4: Invite Friends */}
              <StepperContent value={4} className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Invite Friends</h2>
                  <p className="text-muted-foreground">
                    Add your friends' emails to invite them to the trip
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can change this later or leave some emails empty for now
                  </p>
                </div>
                <div className="space-y-4">
                  <Label>Friend's Email Addresses (Optional)</Label>
                  <div className="grid gap-3">
                    {formData.inviteEmails.map((email, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground w-8">
                          {index + 1}.
                        </span>
                        <Input
                          type="email"
                          placeholder={`friend${index + 1}@example.com`}
                          value={email}
                          onChange={(e) =>
                            updateInviteEmail(index, e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> You can invite more friends later
                      from the group page. Don't worry if you don't have
                      everyone's email right now!
                    </p>
                  </div>
                </div>
              </StepperContent>

              {/* Step 5: Review */}
              <StepperContent value={5} className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Review</h2>
                  <p className="text-muted-foreground">
                    Double-check everything looks good
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">{formData.name}</h3>
                      {formData.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {formData.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIconSmall className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {formData.checkInDate &&
                          format(formData.checkInDate, "MMM d")}{" "}
                        -{" "}
                        {formData.checkOutDate &&
                          format(formData.checkOutDate, "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.checkInDate &&
                          formData.checkOutDate &&
                          `${Math.ceil(
                            (formData.checkOutDate.getTime() -
                              formData.checkInDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} days`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Up to {formData.maxMembers} people
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Including you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Invited Friends</p>
                      {formData.inviteEmails.filter((email) => email.trim())
                        .length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {formData.inviteEmails
                            .filter((email) => email.trim())
                            .map((email, index) => (
                              <p
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                • {email}
                              </p>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          No invitations yet - you can invite friends later
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </StepperContent>
            </StepperPanel>
          </Stepper>
        </div>
      </div>

      {/* Navigation Buttons at Bottom */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="flex space-x-2">
          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} disabled={!canProceed}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
