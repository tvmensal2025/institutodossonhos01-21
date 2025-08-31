-- Atualizar dados da empresa Instituto dos Sonhos
UPDATE company_data SET
  name = 'Instituto dos Sonhos',
  mission = 'Guiar pessoas na transformação integral da saúde física e emocional, proporcionando emagrecimento sustentável, autoestima elevada, bem-estar e qualidade de vida. Rafael e Sirlene acreditam que a verdadeira mudança acontece de dentro para fora, por meio do equilíbrio entre corpo, mente e emoções.',
  vision = 'Ser reconhecido como um centro de referência em saúde integral, emagrecimento e bem-estar, combinando ciência, tecnologia, estética e inteligência emocional. Rafael e Sirlene querem impactar milhares de pessoas, ajudando-as a alcançar longevidade, saúde e confiança, tornando o Instituto dos Sonhos uma clínica completa de saúde e estética.',
  values = '1. Humanização e empatia – Tratamos cada cliente como parte da família Instituto dos Sonhos.
2. Ética e transparência – Compromisso com métodos saudáveis e verdadeiros.
3. Inovação constante – Uso de tecnologia e ciência de ponta.
4. Educação e autoconhecimento – Ensinar para transformar hábitos e comportamentos.
5. Resultados com leveza – Evitando métodos radicais e dolorosos.
6. Equilíbrio corpo-mente – Acreditamos que saúde emocional e física andam juntas.',
  about_us = 'O Instituto dos Sonhos, fundado por Rafael Ferreira e Sirlene Freitas, é especializado em emagrecimento, saúde emocional e estética integrativa. Rafael é coach, hipnólogo, psicoterapeuta, master coach e estudante de Biomedicina, buscando entender profundamente casos clínicos e exames. Sirlene tem as mesmas certificações (coach, hipnose, psicoterapia, inteligência emocional) e é estudante de Nutrição, reforçando o cuidado com a alimentação dos clientes. A equipe conta com nutricionista, biomédicos, fisioterapeutas e educador físico. A estrutura inclui a Academia Sem Dor, com pilates, musculação, fisioterapia, funcional e terapia.',
  target_audience = 'Homens e principalmente mulheres acima de 35 anos, que sofrem com sobrepeso, obesidade, baixa autoestima, dores emocionais, ansiedade e problemas de saúde relacionados aos hábitos de vida. Pessoas que já tentaram outras abordagens sem sucesso e buscam um método humanizado e eficiente, com suporte emocional e físico. Famílias que desejam transformar hábitos e ter uma vida saudável e equilibrada.',
  main_services = 'Programas de emagrecimento (Desafio 7D, Limpeza Hepática, Detox). Coaching e inteligência emocional (individual e em grupo). Psicoterapia e hipnose para desbloqueios emocionais. Estética avançada (botox, enzimas, microagulhamento, hidratação facial, tratamentos capilares, remoção de verrugas). Consultoria online e presencial com planos personalizados. Plataforma digital de emagrecimento com acompanhamento, conteúdo exclusivo e suporte.',
  differentials = 'Atendimento humanizado com Rafael e Sirlene, que direcionam o cliente para o profissional correto quando necessário. Equipe multidisciplinar completa, oferecendo cuidado 360°. Método exclusivo, unindo ciência, mente e estética. Academia Sem Dor como extensão prática para treinos, terapias e fisioterapia. Certificações e expertise obtidas em imersões com os melhores profissionais da área.',
  company_culture = 'Acolhimento e empatia como pilares de todos os atendimentos. Busca por transformação real e não apenas estética. Educação contínua da equipe para oferecer sempre o melhor. Ambiente inspirador, onde cada cliente se sente motivado a cuidar da saúde com prazer.',
  health_philosophy = 'Acreditamos que saúde é uma soma de pequenos hábitos diários. Alimentação natural e equilibrada. Movimento e atividade física com prazer. Gestão emocional (psicoterapia, hipnose e coaching). Prevenção e autocuidado como pilares da longevidade. Transformação interior como chave para resultados externos. Sempre orientamos o usuário a falar com Rafael ou Sirlene, assim cuidamos e se não for algo clínico iremos direcionar para o profissional correto.'
WHERE id IS NOT NULL;

-- Se não existir registro, inserir os dados
INSERT INTO company_data (
  name, mission, vision, values, about_us, target_audience, 
  main_services, differentials, company_culture, health_philosophy
)
SELECT 
  'Instituto dos Sonhos',
  'Guiar pessoas na transformação integral da saúde física e emocional, proporcionando emagrecimento sustentável, autoestima elevada, bem-estar e qualidade de vida. Rafael e Sirlene acreditam que a verdadeira mudança acontece de dentro para fora, por meio do equilíbrio entre corpo, mente e emoções.',
  'Ser reconhecido como um centro de referência em saúde integral, emagrecimento e bem-estar, combinando ciência, tecnologia, estética e inteligência emocional. Rafael e Sirlene querem impactar milhares de pessoas, ajudando-as a alcançar longevidade, saúde e confiança, tornando o Instituto dos Sonhos uma clínica completa de saúde e estética.',
  '1. Humanização e empatia – Tratamos cada cliente como parte da família Instituto dos Sonhos.
2. Ética e transparência – Compromisso com métodos saudáveis e verdadeiros.
3. Inovação constante – Uso de tecnologia e ciência de ponta.
4. Educação e autoconhecimento – Ensinar para transformar hábitos e comportamentos.
5. Resultados com leveza – Evitando métodos radicais e dolorosos.
6. Equilíbrio corpo-mente – Acreditamos que saúde emocional e física andam juntas.',
  'O Instituto dos Sonhos, fundado por Rafael Ferreira e Sirlene Freitas, é especializado em emagrecimento, saúde emocional e estética integrativa. Rafael é coach, hipnólogo, psicoterapeuta, master coach e estudante de Biomedicina, buscando entender profundamente casos clínicos e exames. Sirlene tem as mesmas certificações (coach, hipnose, psicoterapia, inteligência emocional) e é estudante de Nutrição, reforçando o cuidado com a alimentação dos clientes. A equipe conta com nutricionista, biomédicos, fisioterapeutas e educador físico. A estrutura inclui a Academia Sem Dor, com pilates, musculação, fisioterapia, funcional e terapia.',
  'Homens e principalmente mulheres acima de 35 anos, que sofrem com sobrepeso, obesidade, baixa autoestima, dores emocionais, ansiedade e problemas de saúde relacionados aos hábitos de vida. Pessoas que já tentaram outras abordagens sem sucesso e buscam um método humanizado e eficiente, com suporte emocional e físico. Famílias que desejam transformar hábitos e ter uma vida saudável e equilibrada.',
  'Programas de emagrecimento (Desafio 7D, Limpeza Hepática, Detox). Coaching e inteligência emocional (individual e em grupo). Psicoterapia e hipnose para desbloqueios emocionais. Estética avançada (botox, enzimas, microagulhamento, hidratação facial, tratamentos capilares, remoção de verrugas). Consultoria online e presencial com planos personalizados. Plataforma digital de emagrecimento com acompanhamento, conteúdo exclusivo e suporte.',
  'Atendimento humanizado com Rafael e Sirlene, que direcionam o cliente para o profissional correto quando necessário. Equipe multidisciplinar completa, oferecendo cuidado 360°. Método exclusivo, unindo ciência, mente e estética. Academia Sem Dor como extensão prática para treinos, terapias e fisioterapia. Certificações e expertise obtidas em imersões com os melhores profissionais da área.',
  'Acolhimento e empatia como pilares de todos os atendimentos. Busca por transformação real e não apenas estética. Educação contínua da equipe para oferecer sempre o melhor. Ambiente inspirador, onde cada cliente se sente motivado a cuidar da saúde com prazer.',
  'Acreditamos que saúde é uma soma de pequenos hábitos diários. Alimentação natural e equilibrada. Movimento e atividade física com prazer. Gestão emocional (psicoterapia, hipnose e coaching). Prevenção e autocuidado como pilares da longevidade. Transformação interior como chave para resultados externos. Sempre orientamos o usuário a falar com Rafael ou Sirlene, assim cuidamos e se não for algo clínico iremos direcionar para o profissional correto.'
WHERE NOT EXISTS (SELECT 1 FROM company_data);