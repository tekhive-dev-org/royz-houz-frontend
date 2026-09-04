-- Close the direct PostgREST path to public submission functions.
--
-- Public forms must use the web API, where request size limits, sanitization,
-- validation, logging, and rate limiting are enforced. These functions remain
-- SECURITY DEFINER because the server's service-role client invokes them to
-- create intentionally scoped pending submissions.

revoke execute on function public.submit_contact_submission(text, text, text, text, text, text, text)
  from anon, authenticated;
revoke execute on function public.submit_join_application(text, text, text, text, date, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean)
  from anon, authenticated;
revoke execute on function public.submit_blog_comment(uuid, uuid, text, text, text)
  from anon, authenticated;

grant execute on function public.submit_contact_submission(text, text, text, text, text, text, text)
  to service_role;
grant execute on function public.submit_join_application(text, text, text, text, date, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean)
  to service_role;
grant execute on function public.submit_blog_comment(uuid, uuid, text, text, text)
  to service_role;
