"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRightCircle,
  UploadIcon,
Settings,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ArrowRightCircleIcon,
  ShoppingCart,
  UserCheck,
} from "lucide-react";
import React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { LockIcon } from "lucide-react";

type Props = {};

function Page({}: Props) {
  const router = useRouter();
  type Template = {
    id: string;
    name: string;
    icon: React.ReactNode;
    short: string;
    long: string;
  };

const templates: Template[] = [
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    icon: <LockIcon className="h-5 w-5" />,
    short: "Key party and confidentiality terms.",
    long: "Extracts core elements of NDAs including identification of confidential parties, detailed confidentiality obligations, term lengths, permitted disclosures, and breach consequences. This template enables fast parsing of sensitive privacy agreements, ensuring your organization remains protected and compliant with data security requirements.",
  },
  {
    id: "sales_contract",
    name: "Sales Contract",
    icon: <ShoppingCart className="h-5 w-5" />,
    short: "Terms on delivery, payment, and liabilities.",
    long: "Focuses on purchase terms, payment schedules, delivery obligations, warranties, liability limitations, and dispute resolution clauses. This template streamlines the review of commercial agreements by highlighting financial commitments, risk allocations, and important deadlines to minimize transactional risks and improve contract lifecycle management.",
  },
  {
    id: "employment_offer",
    name: "Employment Offer",
    icon: <UserCheck className="h-5 w-5" />,
    short: "Compensation, benefits, and obligations.",
    long: "Targets employee offer letters and contracts by extracting salary details, bonus structures, benefits, confidentiality clauses, non-compete agreements, termination terms, and job duties. This comprehensive template empowers HR and legal teams to onboard employees efficiently while ensuring clarity and legal compliance in employment terms.",
  },
  {
    id: "service_agreement",
    name: "Service Agreement",
    icon: <Settings className="h-5 w-5" />,
    short: "Scope, deliverables, and payment terms.",
    long: "Extracts detailed information on contract scope, defined deliverables, timelines, payment terms, performance standards, intellectual property rights, confidentiality, and termination conditions. This service agreement template helps both providers and clients quickly align expectations and manage risks throughout the service engagement.",
  },
];

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = templates.find((t) => t.id === selectedId) || null;
  const [step, setStep] = React.useState<1 | 2>(1);
  const totalSteps = 2;
  const progressValue = ((step - 1) / totalSteps) * 100; // show progress after completing a step
  const [tag, setTag] = React.useState<
    "none" | "draft" | "confidential" | "internal" | "public"
  >("none");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState<string | null>(null);

  const isFormValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    tag !== "none" &&
    !!file &&
    !!selectedId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      const metadata = {
        name: name.trim(),
        description: description.trim(),
        tag,
        template: selectedId!,
      };
      formData.append("metadata", JSON.stringify(metadata));

      const res = await fetch("/api/contracts/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      // Try to extract a contract id from various shapes
      const toId = (v: any) => (typeof v === "string" ? v : v && typeof v === "object" && "$oid" in v ? String(v.$oid) : undefined);
      const contractId =
        toId(data?.contract_id) ||
        toId(data?._id) ||
        toId(data?.id) ||
        toId(data?.data?.contract_id) ||
        toId(data?.data?._id);

      setSubmitMessage("Uploaded successfully.");
      console.log("Upload API response:", data);

      if (contractId) {
        router.push(`/dashboard/processing/${encodeURIComponent(contractId)}`);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitMessage("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* HEADER */}
      <section className="">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Create New Document</h1>
        </div>
      </section>
      {/* PROGRESS */}
      <div>
        <Progress value={progressValue} aria-label="Progress" />
      </div>
      <Separator />
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.section
            key="step-1"
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <h2 className="text-xl font-light">
              Start by uploading your document, giving it a name and a
              description
            </h2>
            <div className="flex gap-6 items-start">
        <div className="w-1/2 space-y-4">
                <Label>Document Name</Label>
                <Input
                  type="text"
                  placeholder="Enter document name"
          className="mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
                />
                <Label>Document Description</Label>
                <Textarea
                  placeholder="Enter document description"
          className="mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <Label htmlFor="tag-none">Document Tag</Label>
                  {tag !== "none" && (
                    <Badge
                      variant="outline"
                      className="capitalize rounded-full"
                    >
                      {tag}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <RadioGroup
                    value={tag}
                    onValueChange={(v) =>
                      setTag(
                        (v as
                          | "none"
                          | "draft"
                          | "confidential"
                          | "internal"
                          | "public") || "none"
                      )
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    {/* Hidden default option */}
                    <RadioGroupItem
                      value="none"
                      id="tag-none"
                      className="hidden"
                    />
                    {/* Visible options */}
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="tag-draft" value="draft" />
                      <Label htmlFor="tag-draft" className="cursor-pointer">
                        Draft
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        id="tag-confidential"
                        value="confidential"
                      />
                      <Label
                        htmlFor="tag-confidential"
                        className="cursor-pointer"
                      >
                        Confidential
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="tag-internal" value="internal" />
                      <Label htmlFor="tag-internal" className="cursor-pointer">
                        Internal
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="tag-public" value="public" />
                      <Label htmlFor="tag-public" className="cursor-pointer">
                        Public
                      </Label>
                    </div>
                  </RadioGroup>
                  {tag !== "none" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTag("none")}
                      className="shrink-0"
                    >
                      Clear tag
                    </Button>
                  )}
                </div>
              </div>
              <div className="w-1/2">
                <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center h-72 mt-4">
                  <div
                    className="w-full h-full flex flex-col items-center justify-center space-y-4 cursor-pointer"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("bg-gray-50");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("bg-gray-50");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("bg-gray-50");
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        setFile(files[0]);
                      }
                    }}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <UploadIcon className="text-muted-foreground h-24 w-24" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Drag and drop  or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                     Supported format: PDF (max: 100MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setFile(files[0]);
                      }
                    }}
                  />
                  {file && (
                    <p className="mt-3 text-xs text-muted-foreground truncate w-full text-center">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button className="w-fit" type="button" onClick={() => setStep(2)}>
              Next <ArrowRightCircle />
            </Button>
          </motion.section>
        ) : (
          <motion.section
            key="step-2"
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <h2 className="text-xl font-light">
              Select from a variety of templates to suit your document type
            </h2>
            <LayoutGroup>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: template list */}
                <div className="md:col-span-1 space-y-3">
                  {templates.map((t) => (
                    <motion.div
                      layout
                      key={t.id}
                      role="button"
                      aria-pressed={selectedId === t.id}
                      aria-selected={selectedId === t.id}
                      tabIndex={0}
                      onClick={() => setSelectedId(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedId(t.id);
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.6,
                      }}
                      className="focus:outline-none"
                    >
                      <Card
                        className={
                          "cursor-pointer transition-colors bg-transparent rounded-2xl border-border hover:bg-accent/30" +
                          (selectedId === t.id
                            ? " border-primary ring-1 ring-ring bg-accent/40"
                            : "")
                        }
                      >
                        <CardHeader className="flex flex-row items-start gap-3">
                          <div className="shrink-0 rounded-md bg-secondary p-2 text-primary">
                            <AnimatePresence mode="wait" initial={false}>
                              {selectedId === t.id ? (
                                <motion.span
                                  key="check"
                                  initial={{ scale: 0.6, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.6, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  aria-hidden
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="icon"
                                  layoutId={`icon-${t.id}`}
                                  aria-hidden
                                >
                                  {t.icon}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base">
                              {t.name}
                            </CardTitle>
                            <CardDescription className="truncate">
                              {t.short}
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Right: template detail */}
                <div className="md:col-span-2">
                  <Card className="min-h-[16rem] rounded-2xl bg-transparent h-full">
                    <AnimatePresence mode="wait">
                      {selected ? (
                        <motion.div
                          key={selected.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="space-y-4"
                        >
                          <CardHeader className="flex flex-row items-center gap-3">
                            <div className="rounded-md bg-secondary p-2 text-primary">
                              <motion.span layoutId={`icon-${selected.id}`}>
                                {selected.icon}
                              </motion.span>
                            </div>
                            <div>
                              <CardTitle>{selected.name}</CardTitle>
                              <CardDescription>
                                {selected.short}
                              </CardDescription>
                            </div>
                          </CardHeader>
                          <Separator />
                          <CardContent className="text-sm text-muted-foreground">
                            {selected.long}
                          </CardContent>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="h-64"
                        >
                          <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                            Select a template to see details
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </div>
              </div>
            </LayoutGroup>

            <div className="flex items-center space-x-2">
              {step === 2 && (
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={() => setStep(1)}
                  aria-label="Go back to previous step"
                >
                  <ArrowLeft /> Back
                </Button>
              )}
              <Button
                size="lg"
                type="submit"
                disabled={!isFormValid || isSubmitting}
                aria-disabled={!isFormValid || isSubmitting}
                className="group bg-primary text-primary-foreground hover:shadow-primary/30 relative overflow-hidden rounded-full px-6 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? "Submitting..." : "Submit"}
                  <ArrowRightCircleIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="from-primary via-primary/90 to-primary/80 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              </Button>
              {submitMessage && (
                <p className="text-sm text-muted-foreground ml-2">{submitMessage}</p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </form>
  );
}

export default Page;
