# Fix live media uploads rejected by Nginx

Live checks against https://www.xelectron.com/api/media reproduced an HTML
HTTP 413 response identifying nginx/1.28.3 (Ubuntu) for a 2 MiB request.
A 512 KiB request reached the application and returned its JSON HTTP 401.
These unauthenticated probes do not create media objects.

The application accepts images up to 50 MiB and videos up to 250 MiB.
Changing Next.js configuration or compressing images does not correct the
upstream Nginx request limit.

## Apply on the VPS

1. Run `sudo nginx -T` and locate the HTTPS server for `xelectron.com` and
   `www.xelectron.com`, and the location that proxies `/api/media` to Next.js.
   Back up that configuration file before editing it.
2. Copy `deploy/nginx/media-upload.conf` to
   `/etc/nginx/snippets/xelectron-media-upload.conf`.
3. Add this line inside the existing proxy location handling `/api/media`:

   ```nginx
   include /etc/nginx/snippets/xelectron-media-upload.conf;
   ```

   Alternatively, put the three directives from the snippet directly in that
   location. Preserve its existing proxy target, headers and other settings.
   Do not create a duplicate location. If the location handles all application
   routes, the limit will apply to those routes as well. Ensure no more specific
   media location overrides the limit.
4. Validate before reloading:

   ```sh
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. Retry the original 2 MB image while signed in to the dashboard. Confirm a
   successful `/api/media` response and that the returned image URL loads.

The public site also uses Sucuri/Cloudproxy. If larger requests remain blocked
after the Nginx change, check that proxy's request limit separately. This fix
does not establish that the entire 250 MiB video allowance passes every proxy.

The client error correction requires deploying the updated application too.
The Nginx snippet is not applied automatically by `next build` or deployment
of application source files.

Reference: https://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size
