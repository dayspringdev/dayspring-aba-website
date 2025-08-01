// src/components/admin/ContentEditor.tsx

"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { HomePageData } from "@/types/homepage";
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
import { PlusCircle, Trash2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { Json } from "@/types/supabase";

// Define the icon lists
const coreValueIcons = ["Cross", "FlaskConical", "Shield", "Zap", "Users"];
const serviceIcons = ["User", "Users"];
const settingIcons = ["Home", "Video", "School", "MapPin"];
const howItWorksIcons = ["Phone", "FileText", "Target", "Play", "TrendingUp"];
const contactIcons = ["Mail", "Phone", "Clock", "MapPin"];
const socialMediaIcons = ["Instagram", "Facebook", "Linkedin", "Twitter"];

// A reusable type for our generic handlers to avoid 'any'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionObject = { [key: string]: any };

export function ContentEditor() {
  const supabase = createClient();
  const [content, setContent] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publicContactEmail, setPublicContactEmail] = useState("");

  const fetchContent = useCallback(async () => {
    setLoading(true);
    // Fetch both content and the live profile email in parallel
    const [contentRes, profileRes] = await Promise.all([
      supabase.from("homepage_content").select("content").eq("id", 1).single(),
      supabase
        .from("profiles")
        .select("public_contact_email")
        .eq("id", 1)
        .single(),
    ]);

    if (contentRes.error || !contentRes.data) {
      toast.error("Failed to load page content.");
      setLoading(false);
      return;
    }

    // Set the live email into our new state
    if (profileRes.data?.public_contact_email) {
      setPublicContactEmail(profileRes.data.public_contact_email);
    }

    // Continue with setting the main content
    const pageData = contentRes.data.content as unknown as HomePageData;
    if (!pageData.contact.socialMediaLinks) {
      pageData.contact.socialMediaLinks = [];
    }
    setContent(pageData);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    const { error } = await supabase
      .from("homepage_content")
      .update({ content: content as unknown as Json })
      .eq("id", 1);

    if (error) {
      toast.error("Save failed!", { description: error.message });
    } else {
      toast.success("Homepage content updated successfully!");
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !content) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `about-director-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("public-assets").getPublicUrl(filePath);

    handleInputChange("aboutUs", "imageUrl", publicUrl);
    setUploading(false);
    toast.success("Image uploaded! Remember to save all changes.");
  };

  // --- IMMUTABLE STATE HANDLERS ---

  const handleInputChange = (
    section: keyof HomePageData,
    key: string,
    value: string | number | boolean,
    subkey?: string
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      // This handler was already correctly implemented and remains unchanged.
      const newContent = { ...prev, [section]: { ...prev[section] } };
      if (subkey) {
        (newContent[section] as SectionObject)[key] = {
          ...(newContent[section] as SectionObject)[key],
        };
        (newContent[section] as SectionObject)[key][subkey] = value;
      } else {
        (newContent[section] as SectionObject)[key] = value;
      }
      return newContent;
    });
  };

  // === FIX: Corrected all array handlers to be fully immutable ===

  const handleArrayObjectChange = (
    section: keyof HomePageData,
    listKey: string,
    index: number,
    field: string,
    value: string
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[
        listKey
      ] as SectionObject[];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: oldList.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          ),
        },
      };
    });
  };

  const handleAddItem = (
    section: keyof HomePageData,
    listKey: string,
    newItem: object
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[listKey];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: [...oldList, newItem],
        },
      };
    });
  };

  const handleRemoveItem = (
    section: keyof HomePageData,
    listKey: string,
    index: number
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[listKey];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: oldList.filter((_: unknown, i: number) => i !== index),
        },
      };
    });
  };

  const handleStringArrayChange = (
    section: keyof HomePageData,
    listKey: string,
    index: number,
    value: string
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[listKey] as string[];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: oldList.map((item, i) => (i === index ? value : item)),
        },
      };
    });
  };

  const handleAddStringItem = (
    section: keyof HomePageData,
    listKey: string
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[listKey];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: [...oldList, ""],
        },
      };
    });
  };

  const handleRemoveStringItem = (
    section: keyof HomePageData,
    listKey: string,
    index: number
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[listKey];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: oldList.filter((_: unknown, i: number) => i !== index),
        },
      };
    });
  };

  const handleFeaturesChange = (
    section: keyof HomePageData,
    listKey: string,
    index: number,
    value: string
  ) => {
    setContent((prev) => {
      if (!prev) return null;
      const oldList = (prev[section] as SectionObject)[
        listKey
      ] as SectionObject[];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [listKey]: oldList.map((item, i) => {
            if (i === index) {
              return { ...item, features: value.split("\n") };
            }
            return item;
          }),
        },
      };
    });
  };

  if (loading || !content) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-96" />
        <Skeleton className="w-full h-96" />
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ==================================================================== */}
        {/* Hero Section Editor                                                  */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>
              Edit the content for the main banner at the top of the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">Main Headline</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroHeadline1" className="text-xs">
                    Part 1 (Standard Text)
                  </Label>
                  <Input
                    id="heroHeadline1"
                    value={content.hero.headline.part1}
                    onChange={(e) =>
                      handleInputChange(
                        "hero",
                        "headline",
                        e.target.value,
                        "part1"
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroHeadline2" className="text-xs">
                    Part 2 (Primary Color)
                  </Label>
                  <Input
                    id="heroHeadline2"
                    value={content.hero.headline.part2}
                    onChange={(e) =>
                      handleInputChange(
                        "hero",
                        "headline",
                        e.target.value,
                        "part2"
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroHeadline3" className="text-xs">
                    Part 3 (Blue Color)
                  </Label>
                  <Input
                    id="heroHeadline3"
                    value={content.hero.headline.part3}
                    onChange={(e) =>
                      handleInputChange(
                        "hero",
                        "headline",
                        e.target.value,
                        "part3"
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtitle Paragraph</Label>
              <Textarea
                id="heroSubtitle"
                value={content.hero.subtitle}
                onChange={(e) =>
                  handleInputChange("hero", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heroBtn1">Primary Button Text</Label>
                <Input
                  id="heroBtn1"
                  value={content.hero.buttons.primary}
                  onChange={(e) =>
                    handleInputChange(
                      "hero",
                      "buttons",
                      e.target.value,
                      "primary"
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroBtn2">Secondary Button Text</Label>
                <Input
                  id="heroBtn2"
                  value={content.hero.buttons.secondary}
                  onChange={(e) =>
                    handleInputChange(
                      "hero",
                      "buttons",
                      e.target.value,
                      "secondary"
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">
                Trust Indicators
              </Label>
              {content.hero.trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={indicator}
                    onChange={(e) =>
                      handleStringArrayChange(
                        "hero",
                        "trustIndicators",
                        index,
                        e.target.value
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleRemoveStringItem("hero", "trustIndicators", index)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddStringItem("hero", "trustIndicators")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Indicator
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* Mission & Vision Section Editor                                      */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>Purpose & Vision Section</CardTitle>
            <CardDescription>
              Edit the mission and vision statements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mvTitle">Section Title</Label>
              <Input
                id="mvTitle"
                value={content.missionVision.title}
                onChange={(e) =>
                  handleInputChange("missionVision", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mvSubtitle">Section Subtitle</Label>
              <Textarea
                id="mvSubtitle"
                value={content.missionVision.subtitle}
                onChange={(e) =>
                  handleInputChange("missionVision", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label htmlFor="missionTitle">Mission Card Title</Label>
                  <Input
                    id="missionTitle"
                    value={content.missionVision.mission.title}
                    onChange={(e) =>
                      handleInputChange(
                        "missionVision",
                        "mission",
                        e.target.value,
                        "title"
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionText">Mission Card Text</Label>
                  <Textarea
                    id="missionText"
                    rows={5}
                    value={content.missionVision.mission.text}
                    onChange={(e) =>
                      handleInputChange(
                        "missionVision",
                        "mission",
                        e.target.value,
                        "text"
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label htmlFor="visionTitle">Vision Card Title</Label>
                  <Input
                    id="visionTitle"
                    value={content.missionVision.vision.title}
                    onChange={(e) =>
                      handleInputChange(
                        "missionVision",
                        "vision",
                        e.target.value,
                        "title"
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visionText">Vision Card Text</Label>
                  <Textarea
                    id="visionText"
                    rows={5}
                    value={content.missionVision.vision.text}
                    onChange={(e) =>
                      handleInputChange(
                        "missionVision",
                        "vision",
                        e.target.value,
                        "text"
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* Core Values Section Editor                                           */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>Core Values Section</CardTitle>
            <CardDescription>
              Manage the title, subtitle, and list of core values.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cvTitle">Section Title</Label>
              <Input
                id="cvTitle"
                value={content.coreValues.title}
                onChange={(e) =>
                  handleInputChange("coreValues", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvSubtitle">Section Subtitle</Label>
              <Textarea
                id="cvSubtitle"
                value={content.coreValues.subtitle}
                onChange={(e) =>
                  handleInputChange("coreValues", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">Values List</Label>
              {content.coreValues.values.map((value, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem("coreValues", "values", index)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={value.icon}
                        onValueChange={(v) =>
                          handleArrayObjectChange(
                            "coreValues",
                            "values",
                            index,
                            "icon",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {coreValueIcons.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`valueTitle${index}`} className="text-xs">
                        Value Title
                      </Label>
                      <Input
                        id={`valueTitle${index}`}
                        value={value.title}
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "coreValues",
                            "values",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`valueDesc${index}`}>Description</Label>
                    <Textarea
                      id={`valueDesc${index}`}
                      value={value.description}
                      onChange={(e) =>
                        handleArrayObjectChange(
                          "coreValues",
                          "values",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  handleAddItem("coreValues", "values", {
                    icon: "Cross",
                    title: "",
                    description: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Value
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* About Us Section Editor                                              */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>About Section (&quot;Meet The Director&quot;)</CardTitle>
            <CardDescription>
              Manage the image, title, subtitle, bio, and credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">
                Director Portrait
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-1">
                  <Label className="text-xs">Image Preview</Label>
                  <div className="mt-2 aspect-square w-32 relative bg-muted rounded-md flex items-center justify-center">
                    {content.aboutUs.imageUrl ? (
                      <Image
                        src={content.aboutUs.imageUrl}
                        alt="preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No Image
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="aboutImage">Upload New Image</Label>
                  <Input
                    id="aboutImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a JPG, PNG, or WEBP file.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutTitle">Section Title</Label>
              <Input
                id="aboutTitle"
                value={content.aboutUs.title}
                onChange={(e) =>
                  handleInputChange("aboutUs", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutSubtitle">Section Subtitle</Label>
              <Textarea
                id="aboutSubtitle"
                value={content.aboutUs.subtitle}
                onChange={(e) =>
                  handleInputChange("aboutUs", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">Bio Paragraphs</Label>
              {content.aboutUs.bio.map((paragraph, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Textarea
                    value={paragraph}
                    onChange={(e) =>
                      handleStringArrayChange(
                        "aboutUs",
                        "bio",
                        index,
                        e.target.value
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleRemoveStringItem("aboutUs", "bio", index)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddStringItem("aboutUs", "bio")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Paragraph
              </Button>
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">
                Credentials List
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {content.aboutUs.credentials.map((cred, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`cred${index}`} className="text-xs">
                      Credential {index + 1}
                    </Label>
                    <Input
                      id={`cred${index}`}
                      value={cred}
                      onChange={(e) =>
                        handleStringArrayChange(
                          "aboutUs",
                          "credentials",
                          index,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* Services Section Editor                                              */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>Services Section</CardTitle>
            <CardDescription>
              Manage the main services and service settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="servicesTitle">Section Title</Label>
              <Input
                id="servicesTitle"
                value={content.services.title}
                onChange={(e) =>
                  handleInputChange("services", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servicesSubtitle">Section Subtitle</Label>
              <Textarea
                id="servicesSubtitle"
                value={content.services.subtitle}
                onChange={(e) =>
                  handleInputChange("services", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">
                Therapy Services List
              </Label>
              {content.services.therapyServices.map((service, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem("services", "therapyServices", index)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={service.icon}
                        onValueChange={(v) =>
                          handleArrayObjectChange(
                            "services",
                            "therapyServices",
                            index,
                            "icon",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceIcons.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`serviceTitle${index}`}
                        className="text-xs"
                      >
                        Service Title
                      </Label>
                      <Input
                        id={`serviceTitle${index}`}
                        value={service.title}
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "services",
                            "therapyServices",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`serviceDesc${index}`}>Description</Label>
                    <Textarea
                      id={`serviceDesc${index}`}
                      value={service.description}
                      onChange={(e) =>
                        handleArrayObjectChange(
                          "services",
                          "therapyServices",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`serviceFeatures${index}`}>
                      Features (one per line)
                    </Label>
                    <Textarea
                      id={`serviceFeatures${index}`}
                      value={service.features.join("\n")}
                      onChange={(e) =>
                        handleFeaturesChange(
                          "services",
                          "therapyServices",
                          index,
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddItem("services", "therapyServices", {
                    icon: "User",
                    title: "",
                    description: "",
                    features: [],
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <div className="space-y-2">
                <Label htmlFor="settingsTitle">Settings Title</Label>
                <Input
                  id="settingsTitle"
                  value={content.services.settingsTitle}
                  onChange={(e) =>
                    handleInputChange(
                      "services",
                      "settingsTitle",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settingsSubtitle">Settings Subtitle</Label>
                <Textarea
                  id="settingsSubtitle"
                  value={content.services.settingsSubtitle}
                  onChange={(e) =>
                    handleInputChange(
                      "services",
                      "settingsSubtitle",
                      e.target.value
                    )
                  }
                />
              </div>
              <Label className="text-base font-semibold">Settings List</Label>
              {content.services.settings.map((setting, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem("services", "settings", index)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={setting.icon}
                        onValueChange={(v) =>
                          handleArrayObjectChange(
                            "services",
                            "settings",
                            index,
                            "icon",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {settingIcons.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`settingTitle${index}`}
                        className="text-xs"
                      >
                        Setting Title
                      </Label>
                      <Input
                        id={`settingTitle${index}`}
                        value={setting.title}
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "services",
                            "settings",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`settingDesc${index}`}>Description</Label>
                    <Textarea
                      id={`settingDesc${index}`}
                      value={setting.description}
                      onChange={(e) =>
                        handleArrayObjectChange(
                          "services",
                          "settings",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddItem("services", "settings", {
                    icon: "Home",
                    title: "",
                    description: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Setting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* How It Works Section Editor                                          */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>How It Works Section</CardTitle>
            <CardDescription>
              Manage the step-by-step intake process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hiwTitle">Section Title</Label>
              <Input
                id="hiwTitle"
                value={content.howItWorks.title}
                onChange={(e) =>
                  handleInputChange("howItWorks", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiwSubtitle">Section Subtitle</Label>
              <Textarea
                id="hiwSubtitle"
                value={content.howItWorks.subtitle}
                onChange={(e) =>
                  handleInputChange("howItWorks", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">Steps List</Label>
              {content.howItWorks.steps.map((step, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem("howItWorks", "steps", index)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={step.icon}
                        onValueChange={(v) =>
                          handleArrayObjectChange(
                            "howItWorks",
                            "steps",
                            index,
                            "icon",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {howItWorksIcons.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`stepTitle${index}`} className="text-xs">
                        Step Title
                      </Label>
                      <Input
                        id={`stepTitle${index}`}
                        value={step.title}
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "howItWorks",
                            "steps",
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`stepDesc${index}`}>Description</Label>
                    <Textarea
                      id={`stepDesc${index}`}
                      value={step.description}
                      onChange={(e) =>
                        handleArrayObjectChange(
                          "howItWorks",
                          "steps",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddItem("howItWorks", "steps", {
                    icon: "Phone",
                    title: "",
                    description: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* FAQ Section Editor                                                   */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>FAQ Section</CardTitle>
            <CardDescription>
              Manage the frequently asked questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="faqTitle">Section Title</Label>
              <Input
                id="faqTitle"
                value={content.faq.title}
                onChange={(e) =>
                  handleInputChange("faq", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqSubtitle">Section Subtitle</Label>
              <Textarea
                id="faqSubtitle"
                value={content.faq.subtitle}
                onChange={(e) =>
                  handleInputChange("faq", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">Questions List</Label>
              {content.faq.questions.map((faq, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem("faq", "questions", index)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`faqQ${index}`} className="text-xs">
                      Question
                    </Label>
                    <Input
                      id={`faqQ${index}`}
                      value={faq.question}
                      onChange={(e) =>
                        handleArrayObjectChange(
                          "faq",
                          "questions",
                          index,
                          "question",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`faqA${index}`}>Answer</Label>
                    <Textarea
                      id={`faqA${index}`}
                      value={faq.answer}
                      onChange={(e) =>
                        handleArrayObjectChange(
                          "faq",
                          "questions",
                          index,
                          "answer",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddItem("faq", "questions", {
                    question: "",
                    answer: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ==================================================================== */}
        {/* Contact Section ("Get In Touch") Editor                              */}
        {/* ==================================================================== */}
        <Card className="shadow-none border-muted/20">
          <CardHeader>
            <CardTitle>Get In Touch Section</CardTitle>
            <CardDescription>
              Manage the main contact block at the bottom of the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contactTitle">Section Title</Label>
              <Input
                id="contactTitle"
                value={content.contact.title}
                onChange={(e) =>
                  handleInputChange("contact", "title", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactSubtitle">Section Subtitle</Label>
              <Textarea
                id="contactSubtitle"
                value={content.contact.subtitle}
                onChange={(e) =>
                  handleInputChange("contact", "subtitle", e.target.value)
                }
              />
            </div>
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">
                &quot;Let&apos;s Connect&quot; Card Content
              </Label>
              <div className="space-y-2">
                <Label htmlFor="connectTitle">Card Title</Label>
                <Input
                  id="connectTitle"
                  value={content.contact.connectCardTitle}
                  onChange={(e) =>
                    handleInputChange(
                      "contact",
                      "connectCardTitle",
                      e.target.value
                    )
                  }
                />
              </div>

              <Label className="text-sm">Contact Items</Label>

              {content.contact.contactItems.map((item, index) => {
                // If the item is the special "Mail" item, render the read-only view
                if (item.icon === "Mail") {
                  return (
                    <div
                      key={index}
                      className="space-y-3 rounded-lg border p-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Icon</Label>
                          <Input value="Mail" disabled />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`contactItemTitle${index}`}
                            className="text-xs"
                          >
                            Item Title
                          </Label>
                          <Input
                            id={`contactItemTitle${index}`}
                            value={item.title}
                            onChange={(e) =>
                              handleArrayObjectChange(
                                "contact",
                                "contactItems",
                                index,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2 max-w-md">
                        <Label htmlFor={`contactItemDesc${index}`}>
                          Description (Email Address)
                        </Label>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger className="w-full">
                            <div className="relative flex items-center">
                              <Input
                                id={`contactItemDesc${index}`}
                                value={publicContactEmail || "Loading..."}
                                disabled
                                className="cursor-help"
                              />
                              <Info className="absolute right-3 h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="text-center">
                            <p>
                              This email is managed in Settings.
                              <br />
                              Go to{" "}
                              <strong>
                                Settings &gt; Contact Email Configuration
                              </strong>{" "}
                              to update.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`contactItemSubtext${index}`}>
                          Subtext
                        </Label>
                        <Input
                          id={`contactItemSubtext${index}`}
                          value={item.subtext}
                          onChange={(e) =>
                            handleArrayObjectChange(
                              "contact",
                              "contactItems",
                              index,
                              "subtext",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  );
                }

                // Otherwise, render the standard editable item
                return (
                  <div key={index} className="space-y-3 rounded-lg border p-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveItem("contact", "contactItems", index)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Icon</Label>
                        <Select
                          value={item.icon}
                          onValueChange={(v) =>
                            handleArrayObjectChange(
                              "contact",
                              "contactItems",
                              index,
                              "icon",
                              v
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contactIcons.map((i) => (
                              <SelectItem key={i} value={i}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`contactItemTitle${index}`}
                          className="text-xs"
                        >
                          Item Title
                        </Label>
                        <Input
                          id={`contactItemTitle${index}`}
                          value={item.title}
                          onChange={(e) =>
                            handleArrayObjectChange(
                              "contact",
                              "contactItems",
                              index,
                              "title",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`contactItemDesc${index}`}>
                        Description
                      </Label>
                      <Input
                        id={`contactItemDesc${index}`}
                        value={item.description}
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "contact",
                            "contactItems",
                            index,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`contactItemSubtext${index}`}>
                        Subtext
                      </Label>
                      <Input
                        id={`contactItemSubtext${index}`}
                        value={item.subtext}
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "contact",
                            "contactItems",
                            index,
                            "subtext",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleAddItem("contact", "contactItems", {
                    icon: "Mail",
                    title: "",
                    description: "",
                    subtext: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Contact Item
              </Button>
            </div>

            {/* ================== NEW SOCIAL MEDIA EDITOR ================== */}
            <div className="space-y-4 rounded-md border p-4">
              <Label className="text-base font-semibold">
                Social Media Links
              </Label>
              <p className="text-xs text-muted-foreground">
                Add links to your social media profiles. These will appear in
                the contact section and the footer.
              </p>
              {content.contact.socialMediaLinks.map((link, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveItem("contact", "socialMediaLinks", index)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Social Platform</Label>
                      <Select
                        value={link.icon}
                        onValueChange={(v) =>
                          handleArrayObjectChange(
                            "contact",
                            "socialMediaLinks",
                            index,
                            "icon",
                            v
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {socialMediaIcons.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`socialUrl${index}`} className="text-xs">
                        Profile URL
                      </Label>
                      <Input
                        id={`socialUrl${index}`}
                        value={link.url}
                        placeholder="https://instagram.com/your-profile"
                        onChange={(e) =>
                          handleArrayObjectChange(
                            "contact",
                            "socialMediaLinks",
                            index,
                            "url",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  handleAddItem("contact", "socialMediaLinks", {
                    icon: "Instagram",
                    url: "",
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Social Link
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
