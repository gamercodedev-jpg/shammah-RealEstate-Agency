-- Create role enum for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create user_roles table for admin authentication
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create plots table for property listings
CREATE TABLE public.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    size_sqm NUMERIC NOT NULL,
    price_zmw NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
    is_titled BOOLEAN NOT NULL DEFAULT false,
    has_road_access BOOLEAN DEFAULT false,
    has_water BOOLEAN DEFAULT false,
    has_electricity BOOLEAN DEFAULT false,
    soil_type TEXT,
    distance_from_road TEXT,
    images TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on plots
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Plots are publicly readable
CREATE POLICY "Plots are viewable by everyone"
ON public.plots FOR SELECT
USING (true);

-- Only admins can insert plots
CREATE POLICY "Admins can insert plots"
ON public.plots FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can update plots
CREATE POLICY "Admins can update plots"
ON public.plots FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can delete plots
CREATE POLICY "Admins can delete plots"
ON public.plots FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create inquiries table for contact form leads
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an inquiry
CREATE POLICY "Anyone can submit an inquiry"
ON public.inquiries FOR INSERT
WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view inquiries"
ON public.inquiries FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can update inquiries
CREATE POLICY "Admins can update inquiries"
ON public.inquiries FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Create tour_requests table for diaspora virtual tour requests
CREATE TABLE public.tour_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT NOT NULL,
    preferred_date DATE,
    preferred_time TEXT,
    message TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tour_requests
ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a tour request
CREATE POLICY "Anyone can submit a tour request"
ON public.tour_requests FOR INSERT
WITH CHECK (true);

-- Only admins can view tour requests
CREATE POLICY "Admins can view tour requests"
ON public.tour_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can update tour requests
CREATE POLICY "Admins can update tour requests"
ON public.tour_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Create feeds table for company news/updates
CREATE TABLE public.feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feeds
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

-- Published feeds are publicly readable
CREATE POLICY "Published feeds are viewable by everyone"
ON public.feeds FOR SELECT
USING (is_published = true);

-- Admins can view all feeds
CREATE POLICY "Admins can view all feeds"
ON public.feeds FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can insert feeds
CREATE POLICY "Admins can insert feeds"
ON public.feeds FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can update feeds
CREATE POLICY "Admins can update feeds"
ON public.feeds FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Only admins can delete feeds
CREATE POLICY "Admins can delete feeds"
ON public.feeds FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Storage policy: Anyone can view property images
CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Storage policy: Admins can upload property images
CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

-- Storage policy: Admins can update property images
CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

-- Storage policy: Admins can delete property images
CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_plots_updated_at
BEFORE UPDATE ON public.plots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at
BEFORE UPDATE ON public.feeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();