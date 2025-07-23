"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HomePageData } from "@/types/homepage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image"; // Add Image import
import { Skeleton } from "../ui/skeleton"; // Add Skeleton import
import { Database } from "@/types/supabase";

// Get the type for the icon keys from our main HomePageData type
type ServiceIcon = HomePageData["services"]["settings"][number]["icon"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Define our list of selectable icons, ensuring they match the ServiceIcon type
const iconOptions: ServiceIcon[] = ["home", "tv", "school", "users"];

export function ContentEditor() {
  const supabase = createClient();
  const [content, setContent] = useState<Omit<HomePageData, "profile"> | null>(
    null
  );

  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    // Fetch both content and profile data in parallel
    const [contentRes, profileRes] = await Promise.all([
      supabase.from("homepage_content").select("content").eq("id", 1).single(),
      supabase.from("profiles").select("*").eq("id", 1).single(),
    ]);

    if (contentRes.error) toast.error("Failed to load page content.");
    else setContent(contentRes.data.content as Omit<HomePageData, "profile">);

    if (profileRes.error) toast.error("Failed to load profile data.");
    else setProfile(profileRes.data);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSave = async () => {
    setSaving(true);
    // Save both content and profile data in parallel
    const [contentPromise, profilePromise] = await Promise.all([
      supabase
        .from("homepage_content")
        .update({ content: content })
        .eq("id", 1),
      supabase
        .from("profiles")
        .update({
          full_name: profile?.full_name,
          role_title: profile?.role_title,
        })
        .eq("id", 1),
    ]);

    if (contentPromise.error || profilePromise.error) {
      toast.error("Failed to save all changes.");
    } else {
      toast.success("Homepage content and profile updated!");
    }
    setSaving(false);
  };
  const handleProfileChange = (
    key: "full_name" | "role_title",
    value: string
  ) => {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `public-avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", 1);

    if (dbError) {
      toast.error("Failed to save avatar", { description: dbError.message });
    } else {
      // Also update local state to show the new image immediately
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      toast.success("Avatar updated!");
    }
    setUploading(false);
  };

  // --- THIS IS THE FIX for the 'any' type error ---
  // We use generics to make this function strongly typed.
  const handleNestedChange = <T extends keyof Omit<HomePageData, "profile">>(
    section: T,
    key: keyof Omit<HomePageData, "profile">[T],
    value: Omit<HomePageData, "profile">[T][keyof Omit<
      HomePageData,
      "profile"
    >[T]]
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  };

  if (loading || !content || !profile) {
    // A more comprehensive skeleton
    return <div>Loading editor...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Title</Label>
            <Input
              id="heroTitle"
              value={content.hero.title}
              onChange={(e) =>
                handleNestedChange("hero", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtitle</Label>
            <Textarea
              id="heroSubtitle"
              value={content.hero.subtitle}
              onChange={(e) =>
                handleNestedChange("hero", "subtitle", e.target.value)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
          <CardDescription>
            Manage the headshot, name, role, and bio paragraphs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* --- Profile Fields --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <Label>Headshot</Label>
              <div className="flex flex-col items-center gap-4">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Current headshot"
                    width={160}
                    height={160}
                    className="h-40 w-40 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload} // We'll need to define this function
                  disabled={uploading} // and this state
                  className="text-xs"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileFullName">Full Name</Label>
                <Input
                  id="profileFullName"
                  value={profile?.full_name || ""}
                  onChange={(e) =>
                    handleProfileChange("full_name", e.target.value)
                  } // New handler
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileRoleTitle">Role / Title</Label>
                <Input
                  id="profileRoleTitle"
                  value={profile?.role_title || ""}
                  onChange={(e) =>
                    handleProfileChange("role_title", e.target.value)
                  } // New handler
                />
              </div>
            </div>
          </div>

          {/* --- About Section Fields --- */}
          <div className="space-y-2">
            <Label htmlFor="aboutTitle">Section Title</Label>
            <Input
              id="aboutTitle"
              value={content.about.title}
              onChange={(e) =>
                handleNestedChange("about", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Bio Paragraphs</Label>
            {content.about.body.map((paragraph, index) => (
              <div key={index} className="flex items-center gap-2">
                <Textarea
                  placeholder={`Paragraph ${index + 1}`}
                  value={paragraph}
                  onChange={(e) => {
                    const newBody = [...content.about.body];
                    newBody[index] = e.target.value;
                    handleNestedChange("about", "body", newBody);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newBody = content.about.body.filter(
                      (_, i) => i !== index
                    );
                    handleNestedChange("about", "body", newBody);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newBody = [...content.about.body, ""];
                handleNestedChange("about", "body", newBody);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Paragraph
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guiding Principles Section</CardTitle>
          <CardDescription>
            Manage the title, subtitle, and list of core values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* --- FIX IS HERE: Added Labels --- */}
          <div className="space-y-2">
            <Label htmlFor="guidingPrinciplesTitle">Section Title</Label>
            <Input
              id="guidingPrinciplesTitle"
              value={content.guidingPrinciples.title}
              onChange={(e) =>
                handleNestedChange("guidingPrinciples", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guidingPrinciplesSubtitle">Section Subtitle</Label>
            <Textarea
              id="guidingPrinciplesSubtitle"
              value={content.guidingPrinciples.subtitle}
              onChange={(e) =>
                handleNestedChange(
                  "guidingPrinciples",
                  "subtitle",
                  e.target.value
                )
              }
            />
          </div>

          {/* ... inside the Guiding Principles Card ... */}

          <div className="space-y-4 rounded-md border p-4">
            <Label className="text-base font-semibold">Core Values List</Label>
            <div className="space-y-4">
              {content.guidingPrinciples.values.map((value, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  {/* --- FIX IS HERE: Added explicit labels for Title and Description --- */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`value-title-${index}`}
                      className="text-xs font-medium"
                    >
                      Title
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`value-title-${index}`}
                        placeholder="Value Title (e.g., Faith-Centered)"
                        value={value.title}
                        onChange={(e) => {
                          const newList = [...content.guidingPrinciples.values];
                          newList[index].title = e.target.value;
                          handleNestedChange(
                            "guidingPrinciples",
                            "values",
                            newList
                          );
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newList =
                            content.guidingPrinciples.values.filter(
                              (_, i) => i !== index
                            );
                          handleNestedChange(
                            "guidingPrinciples",
                            "values",
                            newList
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`value-desc-${index}`}
                      className="text-xs font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id={`value-desc-${index}`}
                      placeholder="Value description..."
                      value={value.description}
                      onChange={(e) => {
                        const newList = [...content.guidingPrinciples.values];
                        newList[index].description = e.target.value;
                        handleNestedChange(
                          "guidingPrinciples",
                          "values",
                          newList
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                const newList = [
                  ...content.guidingPrinciples.values,
                  { title: "", description: "" },
                ];
                handleNestedChange("guidingPrinciples", "values", newList);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Value
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services Section</CardTitle>
          <CardDescription>
            Manage the main services and the flexible setting options displayed
            on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="servicesTitle">Section Title</Label>
            <Input
              id="servicesTitle"
              value={content.services.title}
              onChange={(e) =>
                handleNestedChange("services", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servicesSubtitle">Section Subtitle</Label>
            <Textarea
              id="servicesSubtitle"
              value={content.services.subtitle}
              onChange={(e) =>
                handleNestedChange("services", "subtitle", e.target.value)
              }
            />
          </div>

          {/* Part 1: Main Service List */}
          <div className="space-y-4 rounded-md border p-4">
            <Label className="text-base font-semibold">
              Main Services List
            </Label>
            <div className="space-y-4">
              {content.services.list.map((service, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  {/* --- FIX IS HERE: Added explicit labels for Title and Description --- */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`service-title-${index}`}
                      className="text-xs font-medium"
                    >
                      Title
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`service-title-${index}`}
                        placeholder="Service Title (e.g., 1:1 ABA Therapy)"
                        value={service.title}
                        onChange={(e) => {
                          const newList = [...content.services.list];
                          newList[index].title = e.target.value;
                          handleNestedChange("services", "list", newList);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newList = content.services.list.filter(
                            (_, i) => i !== index
                          );
                          handleNestedChange("services", "list", newList);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`service-desc-${index}`}
                      className="text-xs font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id={`service-desc-${index}`}
                      placeholder="Service description..."
                      value={service.description}
                      onChange={(e) => {
                        const newList = [...content.services.list];
                        newList[index].description = e.target.value;
                        handleNestedChange("services", "list", newList);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4" // Add some margin top
              onClick={() => {
                const newList = [
                  ...content.services.list,
                  { title: "", description: "" },
                ];
                handleNestedChange("services", "list", newList);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>

          {/* Part 2: Flexible Service Settings */}
          <div className="space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <Label
                htmlFor="settingsTitle"
                className="text-base font-semibold"
              >
                Settings Section Title
              </Label>
              <Input
                id="settingsTitle"
                value={content.services.settingsTitle}
                onChange={(e) =>
                  handleNestedChange(
                    "services",
                    "settingsTitle",
                    e.target.value
                  )
                }
              />
            </div>

            <Label className="text-sm font-medium">Individual Settings</Label>
            <div className="space-y-2">
              {content.services.settings.map((setting, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_2fr_auto] items-center gap-2"
                >
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Icon
                    </Label>
                    <Select
                      value={setting.icon}
                      onValueChange={(value: ServiceIcon) => {
                        const newSettings = [...content.services.settings];
                        newSettings[index].icon = value;
                        handleNestedChange("services", "settings", newSettings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Text
                    </Label>
                    <Input
                      placeholder="Setting Text (e.g., Home-Based)"
                      value={setting.text}
                      onChange={(e) => {
                        const newSettings = [...content.services.settings];
                        newSettings[index].text = e.target.value;
                        handleNestedChange("services", "settings", newSettings);
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-end" // Align button to the bottom
                    onClick={() => {
                      const newSettings = content.services.settings.filter(
                        (_, i) => i !== index
                      );
                      handleNestedChange("services", "settings", newSettings);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // --- THIS IS THE FIX ---
                // Explicitly define the new setting with the correct type.
                // HomePageData['services']['settings'][number] is a robust way to get the type of one item.
                const newSetting: HomePageData["services"]["settings"][number] =
                  {
                    icon: "home", // This is now correctly typed as ServiceIcon
                    text: "",
                  };

                const newSettings = [
                  ...content.services.settings,
                  newSetting, // Add the correctly typed object
                ];
                handleNestedChange("services", "settings", newSettings);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intake Process Section</CardTitle>
          <CardDescription>
            Manage the &quot;Getting Started is Simple&quot; steps on the
            homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intakeTitle">Section Title</Label>
            <Input
              id="intakeTitle"
              value={content.intake.title}
              onChange={(e) =>
                handleNestedChange("intake", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intakeSubtitle">Section Subtitle</Label>
            <Textarea
              id="intakeSubtitle"
              value={content.intake.subtitle}
              onChange={(e) =>
                handleNestedChange("intake", "subtitle", e.target.value)
              }
            />
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <Label className="text-base font-semibold">Intake Steps List</Label>
            <div className="space-y-4">
              {content.intake.steps.map((step, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">Step {index + 1}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newList = content.intake.steps.filter(
                          (_, i) => i !== index
                        );
                        handleNestedChange("intake", "steps", newList);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`step-title-${index}`}
                      className="text-xs font-medium"
                    >
                      Title
                    </Label>
                    <Input
                      id={`step-title-${index}`}
                      placeholder="Step Title (e.g., Book a Free Consultation)"
                      value={step.title}
                      onChange={(e) => {
                        const newList = [...content.intake.steps];
                        newList[index].title = e.target.value;
                        handleNestedChange("intake", "steps", newList);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`step-desc-${index}`}
                      className="text-xs font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id={`step-desc-${index}`}
                      placeholder="Step description..."
                      value={step.description}
                      onChange={(e) => {
                        const newList = [...content.intake.steps];
                        newList[index].description = e.target.value;
                        handleNestedChange("intake", "steps", newList);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                // The 'step' number is derived from the index, so we only need title and desc
                const newList = [
                  ...content.intake.steps,
                  {
                    step: content.intake.steps.length + 1,
                    title: "",
                    description: "",
                  },
                ];
                handleNestedChange("intake", "steps", newList);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>FAQ Section</CardTitle>
          <CardDescription>
            Manage the &quot;Frequently Asked Questions&quot; on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faqTitle">Section Title</Label>
            <Input
              id="faqTitle"
              value={content.faq.title}
              onChange={(e) =>
                handleNestedChange("faq", "title", e.target.value)
              }
            />
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <Label className="text-base font-semibold">Questions List</Label>
            <div className="space-y-4">
              {content.faq.questions.map((faqItem, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  {/* --- THIS IS THE FIX --- */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Question {index + 1}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newList = content.faq.questions.filter(
                          (_, i) => i !== index
                        );
                        handleNestedChange("faq", "questions", newList);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`faq-question-${index}`}
                      className="text-xs font-medium"
                    >
                      Question
                    </Label>
                    <Input
                      id={`faq-question-${index}`}
                      placeholder="Question..."
                      value={faqItem.question}
                      onChange={(e) => {
                        const newList = [...content.faq.questions];
                        newList[index].question = e.target.value;
                        handleNestedChange("faq", "questions", newList);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`faq-answer-${index}`}
                      className="text-xs font-medium"
                    >
                      Answer
                    </Label>
                    <Textarea
                      id={`faq-answer-${index}`}
                      placeholder="Answer..."
                      value={faqItem.answer}
                      onChange={(e) => {
                        const newList = [...content.faq.questions];
                        newList[index].answer = e.target.value;
                        handleNestedChange("faq", "questions", newList);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                const newList = [
                  ...content.faq.questions,
                  { question: "", answer: "" },
                ];
                handleNestedChange("faq", "questions", newList);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Call to Action (CTA) Section</CardTitle>
          <CardDescription>
            Manage the final prompt at the bottom of the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ctaTitle">Title</Label>
            <Input
              id="ctaTitle"
              value={content.cta.title}
              onChange={(e) =>
                handleNestedChange("cta", "title", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaSubtitle">Subtitle</Label>
            <Textarea
              id="ctaSubtitle"
              value={content.cta.subtitle}
              onChange={(e) =>
                handleNestedChange("cta", "subtitle", e.target.value)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save All Content"}
        </Button>
      </div>
    </div>
  );
}
