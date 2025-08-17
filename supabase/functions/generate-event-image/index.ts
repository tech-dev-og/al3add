import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Verify user and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Rate limiting - check if user has generated images recently (max 5 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentGenerations, error: logError } = await supabase
      .from('image_generation_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('generated_at', oneHourAgo);

    if (logError) {
      console.error('Error checking generation logs:', logError);
    } else if (recentGenerations && recentGenerations.length >= 5) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded: Maximum 5 image generations per hour' 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const { prompt } = await req.json();

    // Validate prompt length and content
    if (!prompt) {
      throw new Error("Prompt is required");
    }
    
    if (prompt.length > 1000) {
      throw new Error("Prompt too long (max 1000 characters)");
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    console.log('Generating image with prompt:', prompt)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    console.log('Image generation successful')

    // Download the image from the URL and convert to base64 for permanent storage
    const imageUrl = result.data[0].url;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Convert to base64 using a more efficient method for large files
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binaryString);

    // Log the successful generation
    await supabase
      .from('image_generation_logs')
      .insert({
        user_id: user.id,
        prompt: prompt,
        status: 'success'
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        imageData: base64Image,
        format: 'png'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    
    // Try to log the failed generation if we have user context
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        if (user) {
          const body = await req.text();
          let prompt = 'unknown';
          try {
            prompt = JSON.parse(body).prompt || 'unknown';
          } catch {}
          
          await supabase
            .from('image_generation_logs')
            .insert({
              user_id: user.id,
              prompt: prompt,
              status: 'failed',
              error_message: error.message
            });
        }
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})