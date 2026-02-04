import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import type { Plot, Feed } from "@/types/database";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const SHAMAH_LOGO_URL = "/shammah-logo.png";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://shammah-realestate-agency.onrender.com";

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

  // Form State
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priceZmw, setPriceZmw] = useState(0);
  const [plotImageFile, setPlotImageFile] = useState<File | null>(null);

  // News/Feed form state
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [feedTitle, setFeedTitle] = useState("");
  const [feedContent, setFeedContent] = useState("");
  const [feedPublished, setFeedPublished] = useState(true);
  const [feedImageUrl, setFeedImageUrl] = useState("");
  const [feedImageFile, setFeedImageFile] = useState<File | null>(null);

  function getMasterKey() {
    return window.localStorage.getItem("shammah_key") || "Shammah2026";
  }

  function ensureAdminAuthorized() {
    if (window.sessionStorage.getItem("shammah_admin_authed") === "1") return true;
    navigate("/");
    return false;
  }

  function changeAdminPassword() {
    const current = window.prompt("Enter current password");
    if (current == null) return;

    const key = getMasterKey();
    if (current !== key) {
      toast({ title: "Access denied", description: "Current password is incorrect", variant: "destructive" });
      return;
    }

    const next = window.prompt("Enter new password (min 6 characters)");
    if (next == null) return;

    const confirmNext = window.prompt("Confirm new password");
    if (confirmNext == null) return;

    if (next !== confirmNext) {
      toast({ title: "Passwords do not match", description: "Please re-enter matching passwords.", variant: "destructive" });
      return;
    }

    if (next.trim().length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }

    window.localStorage.setItem("shammah_key", next);
    toast({ title: "Password updated", description: "Master key changed successfully." });
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
      const [plotsRes, newsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/plots`),
        fetch(`${API_BASE_URL}/api/news`),
      ]);

      if (!plotsRes.ok) throw new Error("Failed to load plots");
      if (!newsRes.ok) throw new Error("Failed to load news");

      const plotsRaw = await plotsRes.json();
      const newsRaw = await newsRes.json();

      const mappedPlots: Plot[] = (Array.isArray(plotsRaw) ? plotsRaw : []).map((row: any) => {
        const images = row.image_url ? [row.image_url] : [];
        return {
          id: String(row.id ?? ""),
          title: row.title ?? "",
          description: null,
          location: row.location ?? "",
          size_sqm: 0,
          price_zmw: Number(row.price_zmw ?? 0),
          price_usd: 0,
          status: "available",
          is_sold: row.is_sold === 1 || row.is_sold === true,
          is_titled: false,
          has_road_access: null,
          has_water: null,
          has_electricity: null,
          soil_type: null,
          distance_from_road: null,
          images,
          video_url: null,
          audio_url: null,
          is_featured: null,
          created_at: row.created_at ?? new Date().toISOString(),
          updated_at: row.created_at ?? new Date().toISOString(),
        } as Plot;
      });

      const mappedFeeds: Feed[] = (Array.isArray(newsRaw) ? newsRaw : []).map((row: any) => ({
        id: String(row.id ?? ""),
        title: row.headline ?? "",
        content: row.content ?? "",
        image_url: row.image_url ?? "",
        video_url: null,
        audio_url: null,
        is_published: true,
        created_at: row.published_at ?? new Date().toISOString(),
        updated_at: row.published_at ?? new Date().toISOString(),
      }));

      setPlots(mappedPlots);
      setFeeds(mappedFeeds);
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
      if (!feedImageFile) {
        toast({
          title: "Image required",
          description: "Please choose an image for this news item.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("headline", feedTitle);
      formData.append("content", feedContent);
      formData.append("author", "Admin");
      formData.append("image", feedImageFile);

      const res = await fetch(`${API_BASE_URL}/api/news`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to save news item");
      }

      toast({ title: "Success", description: "News posted" });

      setEditingFeed(null);
      setFeedTitle("");
      setFeedContent("");
      setFeedPublished(true);
      setFeedImageUrl("");
      setFeedImageFile(null);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save news", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteFeed = async (id: string) => {
    if (!confirm("Delete this news post?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/news/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204 && res.status !== 404) {
        throw new Error("Failed to delete news item");
      }
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete news item", variant: "destructive" });
    }
  };

  async function handlePlotSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!plotImageFile) {
        toast({
          title: "Image required",
          description: "Please choose an image for this listing.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("location", location);
      formData.append("price_zmw", String(priceZmw));
      formData.append("image", plotImageFile);

      const res = await fetch(`${API_BASE_URL}/api/plots`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to save plot");
      }

      toast({ title: "Success", description: "Plot added" });

      // Reset form
      setEditingPlot(null);
      setTitle("");
      setLocation("");
      setPriceZmw(0);
      setPlotImageFile(null);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save plot", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/plots/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204 && res.status !== 404) {
        throw new Error("Failed to delete listing");
      }
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete listing", variant: "destructive" });
    }
  };

  const togglePlotSold = async (plot: Plot, nextValue: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/plots/${plot.id}/sold`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_sold: nextValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to update sold status");
      }

      const updated = await res.json();
      const updatedIsSold = updated.is_sold === 1 || updated.is_sold === true;

      setPlots((prev) =>
        prev.map((p) => (p.id === plot.id ? { ...p, is_sold: updatedIsSold } : p)),
      );
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update sold status", variant: "destructive" });
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
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPlotImageFile(file);
                }}
              />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Saving..." : "Save Plot to Database"}
              </Button>
            </form>

            <div className="border rounded-xl bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Price (ZMW)</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plots.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.price_zmw}</TableCell>
                      <TableCell>
                        <Switch
                          checked={!!p.is_sold}
                          onCheckedChange={(value) => togglePlotSold(p, value)}
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
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] as File | undefined;
                    setFeedImageFile(file || null);
                  }}
                />
                <div className="text-xs text-muted-foreground">Choose an image to display with this news post.</div>
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