/**
 * Repository Pattern: SEO Repository (Google Business Profile & Search Console) — Alien OS
 * Lê exclusivamente dados persistidos no Supabase das tabelas:
 * public.gmb_locations, public.gmb_daily_metrics, public.gmb_reviews,
 * public.gsc_sites, public.gsc_daily_metrics, public.gsc_keyword_queries.
 *
 * REGRA DE OURO: O Repository lê exclusivamente do Supabase e NÃO realiza chamadas HTTP externas para APIs.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export interface GmbLocationRecord {
  id: string;
  locationId: string;
  locationName: string;
  address: string;
  phoneNumber: string;
  rating: number;
  reviewCount: number;
  lastSyncedAt: string;
}

export interface GmbReviewRecord {
  id: string;
  locationId: string;
  reviewId: string;
  reviewerName: string;
  starRating: number;
  comment: string;
  replyText?: string;
  reviewTime: string;
}

export interface GscSiteRecord {
  id: string;
  siteUrl: string;
  permissionLevel: string;
  lastSyncedAt: string;
}

export interface GscKeywordRecord {
  id: string;
  siteUrl: string;
  queryText: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export class SeoRepository {
  /**
   * Lê fichas GMB no Supabase
   */
  async listGmbLocations(): Promise<GmbLocationRecord[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("gmb_locations")
        .select("*")
        .eq("active", true);

      if (!data || data.length === 0) return [];

      return data.map((l: any) => ({
        id: l.id,
        locationId: l.location_id,
        locationName: l.location_name,
        address: l.address,
        phoneNumber: l.phone_number,
        rating: Number(l.rating) || 5.0,
        reviewCount: l.review_count || 0,
        lastSyncedAt: new Date(l.last_synced_at).toLocaleTimeString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler gmb_locations no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê avaliações de clientes GMB no Supabase
   */
  async listGmbReviews(locationId?: string): Promise<GmbReviewRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("gmb_reviews").select("*").eq("active", true);

      if (locationId) {
        query = query.eq("location_id", locationId);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((r: any) => ({
        id: r.id,
        locationId: r.location_id,
        reviewId: r.review_id,
        reviewerName: r.reviewer_name,
        starRating: r.star_rating,
        comment: r.comment,
        replyText: r.reply_text,
        reviewTime: new Date(r.review_time).toLocaleDateString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler gmb_reviews no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê palavras-chave do Search Console no Supabase
   */
  async listGscKeywords(siteUrl?: string): Promise<GscKeywordRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("gsc_keyword_queries").select("*").eq("active", true).order("clicks", { ascending: false });

      if (siteUrl) {
        query = query.eq("site_url", siteUrl);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((k: any) => ({
        id: k.id,
        siteUrl: k.site_url,
        queryText: k.query_text,
        clicks: k.clicks,
        impressions: k.impressions,
        ctr: Number(k.ctr) || 0,
        position: Number(k.position) || 1.0,
      }));
    } catch (err) {
      console.error("Erro ao ler gsc_keyword_queries no Supabase:", err);
      return [];
    }
  }
}

export const seoRepository = new SeoRepository();
