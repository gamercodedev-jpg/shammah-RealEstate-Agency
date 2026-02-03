import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { Plot, Feed } from "@/types/database";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const BUCKET_NAME = "shamah-media";
const SHAMAH_LOGO_URL = "/shamah-logo.png";

function uniqueFilePath(file: File) {
  return `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
}

function isBucketNotFoundError(err: unknown) {
  const msg = (err as any)?.message as string | undefined;
  return typeof msg === "string" && msg.toLowerCase().includes("bucket") && msg.toLowerCase().includes("not found");
}

export default function Admin() {
  const navigate = useNavigate();
  const authCheckedRef = useRef(false);

  const [plots, setPlots] = useState<Plot[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"plots" | "news">("plots");
  const [soldUpdatingId, setSoldUpdatingId] = useState<string | null>(null);

  // Form State
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priceZmw, setPriceZmw] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // News/Feed form state
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [feedTitle, setFeedTitle] = useState("");
  const [feedContent, setFeedContent] = useState("");
  const [feedPublished, setFeedPublished] = useState(true);
  const [feedImageUrl, setFeedImageUrl] = useState("");
  const [feedImageFile, setFeedImageFile] = useState<File | null>(null);
  const [feedVideoFile, setFeedVideoFile] = useState<File | null>(null);
  const [feedAudioFile, setFeedAudioFile] = useState<File | null>(null);

  function getMasterKey() {
    return window.localStorage.getItem("shamah_key") || "Shammah2026";
  }

  function ensureAdminAuthorized() {
    if (window.sessionStorage.getItem("shamah_admin_authed") === "1") return true;

    const input = window.prompt("Master Access Key");
    const key = getMasterKey();
    if (input !== key) {
      window.alert("Access Denied");
      navigate("/");
      return false;
    }

    window.sessionStorage.setItem("shamah_admin_authed", "1");
    return true;
  }

  function changeAdminPassword() {
    const current = window.prompt("Enter current password");
    if (current == null) return;

    const key = getMasterKey();
    if (current !== key) {
      window.alert("Access Denied");
      return;
    }

    const next = window.prompt("Enter new password (min 6 characters)");
    if (next == null) return;

    const confirmNext = window.prompt("Confirm new password");
    if (confirmNext == null) return;

    if (next !== confirmNext) {
      window.alert("Passwords do not match");
      return;
    }

    if (next.trim().length < 6) {
      window.alert("Password must be at least 6 characters");
      return;
    }

    window.localStorage.setItem("shamah_key", next);
    window.alert("Password updated successfully");
  }

  useEffect(() => {
    // React 18 StrictMode runs effects twice in dev.
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    if (!ensureAdminAuthorized()) return;
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data: plotsData, error: plotsError } = await supabase
        .from("plots")
        .select("*")
        .order("created_at", { ascending: false });

      if (plotsError) throw plotsError;
      setPlots(((plotsData as unknown) as Plot[]) || []);

      const { data: feedsData, error: feedsError } = await supabase
        .from("feeds")
        .select("*")
        .order("created_at", { ascending: false });

      if (feedsError) {
        const status = (feedsError as any)?.status;
        if (status === 404) {
          setFeeds([]);
          toast({
            title: "News not set up",
            description:
              "Your Supabase project is missing the feeds table. Run supabase/migrations/20260125_one_click_setup_free_mode.sql in Supabase SQL Editor.",
            variant: "destructive",
          });
        } else {
          throw feedsError;
        }
      } else {
        setFeeds(((feedsData as unknown) as Feed[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      async function uploadToBucket(file: File) {
        const path = uniqueFilePath(file);
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
        if (error) {
          if (isBucketNotFoundError(error)) {
            toast({
              title: "Storage bucket not found",
              description: `Create a Supabase Storage bucket named "${BUCKET_NAME}" (Storage → Buckets) and make it public.`,
              variant: "destructive",
            });
          }
          throw error;
        }
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
        return data.publicUrl;
      }

      const uploadedImageUrl = feedImageFile ? await uploadToBucket(feedImageFile) : null;
      const uploadedVideoUrl = feedVideoFile ? await uploadToBucket(feedVideoFile) : null;
      const uploadedAudioUrl = feedAudioFile ? await uploadToBucket(feedAudioFile) : null;

      const payload = {
        title: feedTitle,
        content: feedContent,
        is_published: feedPublished,
        image_url: (uploadedImageUrl || (feedImageUrl.trim() ? feedImageUrl.trim() : null)) as string | null,
        video_url: uploadedVideoUrl as string | null,
        audio_url: uploadedAudioUrl as string | null,
      };

      if (editingFeed) {
        await supabase.from("feeds").update(payload as any).eq("id", editingFeed.id);
        toast({ title: "Success", description: "News updated" });
      } else {
        await supabase.from("feeds").insert([payload as any] as any);
        toast({ title: "Success", description: "News posted" });
      }

      setEditingFeed(null);
      setFeedTitle("");
      setFeedContent("");
      setFeedPublished(true);
      setFeedImageUrl("");
      setFeedImageFile(null);
      setFeedVideoFile(null);
      setFeedAudioFile(null);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save news", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteFeed = async (id: string) => {
    if (!confirm("Delete this news post?")) return;
    const { error } = await supabase.from("feeds").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    fetchAll();
  };

  async function handlePlotSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let filenames: string[] = editingPlot?.images || [];

      if (imageFiles.length > 0) {
        const uploads = await Promise.all(
          imageFiles.map(async (file) => {
            const name = `${Date.now()}_${file.name}`;
            await supabase.storage.from(BUCKET_NAME).upload(name, file);
            return name;
          })
        );
        filenames = editingPlot ? [...filenames, ...uploads] : uploads;
      }

      const payload: Partial<Plot> & Record<string, unknown> = {
        title,
        description,
        location,
        price_zmw: priceZmw,
        // Required by the generated Supabase types in many projects.
        // If your DB columns differ, Supabase will return a runtime error.
        price_usd: (editingPlot as any)?.price_usd ?? 0,
        size_sqm: (editingPlot as any)?.size_sqm ?? 0,
        is_titled: (editingPlot as any)?.is_titled ?? false,
        images: filenames,
        is_featured: true,
        status: "available",
      };

      if (editingPlot) {
        await supabase.from("plots").update(payload as any).eq("id", editingPlot.id);
        toast({ title: "Success", description: "Plot updated" });
      } else {
        await supabase.from("plots").insert([payload as any] as any);
        toast({ title: "Success", description: "Plot added" });
      }

      // Reset form
      setEditingPlot(null); setTitle(""); setDescription(""); setLocation(""); setPriceZmw(0); setImageFiles([]);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    await supabase.from("plots").delete().eq("id", id);
    fetchAll();
  };

  const handleToggleSold = async (plotId: string, isSold: boolean) => {
    setSoldUpdatingId(plotId);
    const previous = plots;
    setPlots((curr) => curr.map((p) => (p.id === plotId ? ({ ...p, is_sold: isSold } as Plot) : p)));
    try {
      const { error } = await supabase.from("plots").update({ is_sold: isSold } as any).eq("id", plotId);
      if (error) throw error;
    } catch (err: any) {
      setPlots(previous);
      toast({ title: "Error", description: err?.message || "Failed to update sold status", variant: "destructive" });
    } finally {
      setSoldUpdatingId(null);
    }
  };

  return (
    <Layout>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${SHAMAH_LOGO_URL})` }}
        />

        <div className="container py-10 relative z-10">
          <h1 className="text-3xl font-bold mb-8 text-green-700">shamah Property Admin</h1>
          <div className="flex gap-4 mb-8">
            <Button onClick={() => setTab("plots")} variant={tab === "plots" ? "default" : "outline"}>Manage Plots</Button>
            <Button onClick={() => setTab("news")} variant={tab === "news" ? "default" : "outline"}>Post News</Button>
          </div>

          <div className="flex justify-end mb-8">
            <Button type="button" variant="outline" onClick={changeAdminPassword}>
              Change Password
            </Button>
          </div>

        {tab === "plots" ? (
          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={handlePlotSave} className="space-y-4 p-6 bg-white border rounded-xl shadow-sm">
              <h2 className="text-xl font-bold">{editingPlot ? "Edit Listing" : "Create New Listing"}</h2>
              <Input placeholder="Plot Title" value={title} onChange={e => setTitle(e.target.value)} required />
              <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
              <Input type="number" placeholder="Price (ZMW)" value={priceZmw} onChange={e => setPriceZmw(Number(e.target.value))} required />
              <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
              <Input type="file" multiple accept="image/*" onChange={e => setImageFiles(Array.from(e.target.files || []))} />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Saving..." : "Save Plot to Database"}
              </Button>
            </form>

            <div className="border rounded-xl bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plots.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>
                        <Switch
                          checked={!!(p as any).is_sold}
                          onCheckedChange={(checked) => handleToggleSold(p.id, checked)}
                          disabled={soldUpdatingId === p.id}
                        />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingPlot(p); setTitle(p.title); setLocation(p.location || ""); setPriceZmw(p.price_zmw || 0); }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {plots.length === 0 && <div className="p-8 text-center text-gray-500">No plots found in database.</div>}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={handleFeedSave} className="space-y-4 p-6 bg-white border rounded-xl shadow-sm">
              <h2 className="text-xl font-bold">{editingFeed ? "Edit News" : "Post News"}</h2>
              <Input placeholder="News title" value={feedTitle} onChange={e => setFeedTitle(e.target.value)} required />
              <Textarea placeholder="Write your news content..." value={feedContent} onChange={e => setFeedContent(e.target.value)} className="min-h-[160px]" required />
              <div className="space-y-2">
                <div className="text-sm font-medium">News image</div>
                <Input type="file" accept="image/*" onChange={(e) => setFeedImageFile((e.target.files?.[0] as File) || null)} />
                <div className="text-xs text-muted-foreground">Or paste a public image URL:</div>
                <Input placeholder="Optional image URL (public)" value={feedImageUrl} onChange={e => setFeedImageUrl(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">News video (optional)</div>
                <Input type="file" accept="video/*" onChange={(e) => setFeedVideoFile((e.target.files?.[0] as File) || null)} />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">News audio (optional)</div>
                <Input type="file" accept="audio/*" onChange={(e) => setFeedAudioFile((e.target.files?.[0] as File) || null)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={feedPublished} onChange={(e) => setFeedPublished(e.target.checked)} />
                Publish on website
              </label>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Saving..." : editingFeed ? "Update News" : "Post News"}
              </Button>
            </form>

            <div className="border rounded-xl bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeds.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.title}</TableCell>
                      <TableCell>{f.is_published === false ? "No" : "Yes"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingFeed(f);
                            setFeedTitle(f.title || "");
                            setFeedContent(f.content || "");
                            setFeedPublished(f.is_published !== false);
                            setFeedImageUrl(f.image_url || "");
                            setFeedImageFile(null);
                            setFeedVideoFile(null);
                            setFeedAudioFile(null);
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteFeed(f.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {feeds.length === 0 && <div className="p-8 text-center text-gray-500">No news posts found.</div>}
            </div>
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
}