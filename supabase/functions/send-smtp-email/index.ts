import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !userRole) {
      return new Response(JSON.stringify({ error: 'Access denied: Admin role required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Rate limiting - check if user has sent emails recently
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentEmails, error: logError } = await supabase
      .from('smtp_email_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('sent_at', oneHourAgo);

    if (logError) {
      console.error('Error checking email logs:', logError);
    } else if (recentEmails && recentEmails.length >= 10) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded: Maximum 10 emails per hour' 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const { to, subject, html, from }: EmailRequest = await req.json();

    // Input validation
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error("SMTP configuration is incomplete");
    }

    console.log(`Connecting to SMTP server: ${smtpHost}:${smtpPort}`);

    // Connect to SMTP server
    const conn = await Deno.connect({
      hostname: smtpHost,
      port: smtpPort,
    });

    // Helper function to send command and read response
    const sendCommand = async (command: string): Promise<string> => {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      await conn.write(encoder.encode(command + "\r\n"));
      
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    try {
      // Read server greeting
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      const greeting = new TextDecoder().decode(buffer.subarray(0, n || 0));
      console.log("Server greeting:", greeting);

      // Send EHLO
      const ehloResponse = await sendCommand(`EHLO ${smtpHost}`);
      console.log("EHLO response:", ehloResponse);

      // Start TLS if port 587
      if (smtpPort === 587) {
        const tlsResponse = await sendCommand("STARTTLS");
        console.log("STARTTLS response:", tlsResponse);
        
        // Upgrade connection to TLS
        const tlsConn = await Deno.startTls(conn, { hostname: smtpHost });
        conn.close();
        
        // Re-establish connection with TLS
        const ehloTlsResponse = await sendCommand(`EHLO ${smtpHost}`);
        console.log("EHLO TLS response:", ehloTlsResponse);
      }

      // Authenticate
      const authResponse = await sendCommand("AUTH LOGIN");
      console.log("AUTH response:", authResponse);

      // Send username (base64 encoded)
      const usernameB64 = btoa(smtpUser);
      const userResponse = await sendCommand(usernameB64);
      console.log("Username response:", userResponse);

      // Send password (base64 encoded)
      const passwordB64 = btoa(smtpPassword);
      const passResponse = await sendCommand(passwordB64);
      console.log("Password response:", passResponse);

    // Send email - enforce from address for security
    const fromEmail = smtpUser; // Always use SMTP user as from address
    const mailFromResponse = await sendCommand(`MAIL FROM:<${fromEmail}>`);
    console.log("MAIL FROM response:", mailFromResponse);

      const rcptToResponse = await sendCommand(`RCPT TO:<${to}>`);
      console.log("RCPT TO response:", rcptToResponse);

      const dataResponse = await sendCommand("DATA");
      console.log("DATA response:", dataResponse);

      // Compose email
      const emailContent = [
        `From: ${fromEmail}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        html,
        ``,
        `.`
      ].join("\r\n");

      const sendResponse = await sendCommand(emailContent);
      console.log("Send response:", sendResponse);

      // Quit
      await sendCommand("QUIT");

    } finally {
      conn.close();
    }

    console.log("Email sent successfully via SMTP");

    // Log the successful email
    await supabase
      .from('smtp_email_logs')
      .insert({
        user_id: user.id,
        recipient_email: to,
        subject: subject,
        status: 'sent'
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-smtp-email function:", error);
    
    // Try to log the failed email if we have user context
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
          await supabase
            .from('smtp_email_logs')
            .insert({
              user_id: user.id,
              recipient_email: 'unknown',
              subject: 'failed',
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
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);