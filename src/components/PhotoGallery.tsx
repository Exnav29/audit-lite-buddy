import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package } from "lucide-react";

interface PhotoItem {
  id: string;
  photo_url: string;
  description: string;
  category: string;
  area_name: string;
}

interface PhotoGalleryProps {
  projectId: string;
}

const PhotoGallery = ({ projectId }: PhotoGalleryProps) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
  }, [projectId]);

  const fetchPhotos = async () => {
    try {
      const { data: equipment, error } = await supabase
        .from("equipment")
        .select(`
          id,
          photo_url,
          description,
          category,
          area_id,
          areas (
            name
          )
        `)
        .not("photo_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter to only equipment in areas belonging to this project
      const { data: projectAreas, error: areasError } = await supabase
        .from("areas")
        .select("id")
        .eq("project_id", projectId);

      if (areasError) throw areasError;

      const projectAreaIds = new Set(projectAreas?.map(a => a.id) || []);
      
      const filteredPhotos: PhotoItem[] = (equipment || [])
        .filter(item => projectAreaIds.has(item.area_id))
        .map(item => ({
          id: item.id,
          photo_url: item.photo_url!,
          description: item.description,
          category: item.category,
          area_name: (item.areas as any)?.name || "Unknown Area",
        }));

      setPhotos(filteredPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No equipment photos available yet. Add photos to equipment to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square relative overflow-hidden bg-muted">
            <img
              src={photo.photo_url}
              alt={photo.description}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2">{photo.description}</p>
                <p className="text-xs text-muted-foreground">{photo.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs truncate">{photo.area_name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PhotoGallery;
