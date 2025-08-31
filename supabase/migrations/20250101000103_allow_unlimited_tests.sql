-- Permitir exames ilimitados durante testes (temporário)
-- Esta função não cobra créditos para facilitar testes

create or replace function public.finalize_medical_document_test(
  p_tmp_path text,
  p_idempotency_key text default null
) returns json language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_document_id uuid;
  v_credit_cost int := 0; -- Não cobrar créditos durante testes
  v_credits_available int;
  v_credits_charged int := 0; -- Não cobrar créditos
  v_result json;
begin
  -- Verificar se o usuário está autenticado
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  -- Verificar se já foi processado (idempotência)
  if p_idempotency_key is not null then
    select id into v_document_id 
    from public.medical_documents 
    where idempotency_key = p_idempotency_key 
    and user_id = v_user_id;
    
    if v_document_id is not null then
      return json_build_object(
        'success', true,
        'message', 'Documento já processado',
        'document_id', v_document_id,
        'credits_charged', 0
      );
    end if;
  end if;

  -- Criar registro do documento (sem cobrar créditos)
  insert into public.medical_documents (
    user_id,
    title,
    type,
    file_url,
    status,
    is_submitted,
    idempotency_key,
    credit_cost,
    credits_charged,
    credits_charged_at,
    draft_tmp_path,
    processing_started_at,
    processing_stage,
    progress_pct,
    images_total,
    images_processed,
    estimated_minutes
  ) values (
    v_user_id,
    'Exame de Teste',
    'exame_laboratorial',
    p_tmp_path,
    'submitted',
    true,
    p_idempotency_key,
    v_credit_cost,
    v_credits_charged,
    now(),
    p_tmp_path,
    now(),
    'iniciado',
    0,
    0,
    0,
    5
  ) returning id into v_document_id;

  return json_build_object(
    'success', true,
    'message', 'Documento finalizado para teste (sem cobrança)',
    'document_id', v_document_id,
    'credits_charged', 0,
    'credit_cost', 0
  );

exception when others then
  return json_build_object(
    'success', false,
    'error', sqlerrm,
    'credits_charged', 0
  );
end;
$$;

-- Comentário explicativo
comment on function public.finalize_medical_document_test is 'Função temporária para permitir exames ilimitados durante testes - NÃO COBRA CRÉDITOS';
