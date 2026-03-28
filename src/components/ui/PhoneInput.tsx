'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const COUNTRY_CODES = [
  { code: '+55',  flag: '🇧🇷', name: 'Brasil',         hasDDD: true  },
  { code: '+1',   flag: '🇺🇸', name: 'EUA / Canadá',   hasDDD: false },
  { code: '+351', flag: '🇵🇹', name: 'Portugal',        hasDDD: false },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina',       hasDDD: false },
  { code: '+598', flag: '🇺🇾', name: 'Uruguai',         hasDDD: false },
  { code: '+595', flag: '🇵🇾', name: 'Paraguai',        hasDDD: false },
  { code: '+591', flag: '🇧🇴', name: 'Bolívia',         hasDDD: false },
  { code: '+56',  flag: '🇨🇱', name: 'Chile',           hasDDD: false },
  { code: '+57',  flag: '🇨🇴', name: 'Colômbia',        hasDDD: false },
  { code: '+51',  flag: '🇵🇪', name: 'Peru',            hasDDD: false },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela',       hasDDD: false },
  { code: '+593', flag: '🇪🇨', name: 'Equador',         hasDDD: false },
  { code: '+44',  flag: '🇬🇧', name: 'Reino Unido',     hasDDD: false },
  { code: '+34',  flag: '🇪🇸', name: 'Espanha',         hasDDD: false },
  { code: '+33',  flag: '🇫🇷', name: 'França',          hasDDD: false },
  { code: '+49',  flag: '🇩🇪', name: 'Alemanha',        hasDDD: false },
  { code: '+39',  flag: '🇮🇹', name: 'Itália',          hasDDD: false },
  { code: '+31',  flag: '🇳🇱', name: 'Holanda',         hasDDD: false },
  { code: '+41',  flag: '🇨🇭', name: 'Suíça',           hasDDD: false },
  { code: '+52',  flag: '🇲🇽', name: 'México',          hasDDD: false },
  { code: '+81',  flag: '🇯🇵', name: 'Japão',           hasDDD: false },
  { code: '+82',  flag: '🇰🇷', name: 'Coreia do Sul',   hasDDD: false },
  { code: '+86',  flag: '🇨🇳', name: 'China',           hasDDD: false },
  { code: '+91',  flag: '🇮🇳', name: 'Índia',           hasDDD: false },
  { code: '+61',  flag: '🇦🇺', name: 'Austrália',       hasDDD: false },
  { code: '+27',  flag: '🇿🇦', name: 'África do Sul',   hasDDD: false },
  { code: '+20',  flag: '🇪🇬', name: 'Egito',           hasDDD: false },
  { code: '+971', flag: '🇦🇪', name: 'Emirados Árabes', hasDDD: false },
  { code: '+972', flag: '🇮🇱', name: 'Israel',          hasDDD: false },
]

const BR_DDD_LIST = [
  '11','12','13','14','15','16','17','18','19', // SP
  '21','22','24',                               // RJ
  '27','28',                                    // ES
  '31','32','33','34','35','37','38',           // MG
  '41','42','43','44','45','46',                // PR
  '47','48','49',                               // SC
  '51','53','54','55',                          // RS
  '61',                                         // DF
  '62','64',                                    // GO
  '63',                                         // TO
  '65','66',                                    // MT
  '67',                                         // MS
  '68',                                         // AC
  '69',                                         // RO
  '71','73','74','75','77',                     // BA
  '79',                                         // SE
  '81','87',                                    // PE
  '82',                                         // AL
  '83',                                         // PB
  '84',                                         // RN
  '85','88',                                    // CE
  '86','89',                                    // PI
  '91','93','94',                               // PA
  '92','97',                                    // AM
  '95',                                         // RR
  '96',                                         // AP
  '98','99',                                    // MA
]

interface PhoneInputProps {
  value: string          // formato final: +5511999999999
  onChange: (value: string) => void
  label?: string
  hint?: string
  className?: string
}

function parsePhone(full: string) {
  if (!full) return { ddi: '+55', ddd: '', number: '' }

  for (const c of [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)) {
    if (full.startsWith(c.code)) {
      const rest = full.slice(c.code.length)
      if (c.hasDDD && rest.length >= 2) {
        return { ddi: c.code, ddd: rest.slice(0, 2), number: rest.slice(2) }
      }
      return { ddi: c.code, ddd: '', number: rest }
    }
  }
  return { ddi: '+55', ddd: '', number: full }
}

export function PhoneInput({ value, onChange, label, hint, className }: PhoneInputProps) {
  const parsed = parsePhone(value)
  const [ddi, setDdi] = useState(parsed.ddi)
  const [ddd, setDdd] = useState(parsed.ddd)
  const [number, setNumber] = useState(parsed.number)

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === ddi) ?? COUNTRY_CODES[0]

  useEffect(() => {
    const assembled = ddi + (selectedCountry.hasDDD ? ddd : '') + number
    onChange(assembled)
  }, [ddi, ddd, number])

  // Sincroniza se o valor externo mudar (ex: carregado da API)
  useEffect(() => {
    if (!value) return
    const p = parsePhone(value)
    setDdi(p.ddi)
    setDdd(p.ddd)
    setNumber(p.number)
  }, [value])

  const inputClass =
    'px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 bg-white'

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {/* DDI */}
        <select
          value={ddi}
          onChange={(e) => { setDdi(e.target.value); setDdd(''); setNumber('') }}
          className={cn(inputClass, 'flex-shrink-0 w-[140px] cursor-pointer')}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>

        {/* DDD — apenas para Brasil */}
        {selectedCountry.hasDDD && (
          <select
            value={ddd}
            onChange={(e) => setDdd(e.target.value)}
            className={cn(inputClass, 'flex-shrink-0 w-[90px] cursor-pointer')}
          >
            <option value="">DDD</option>
            {BR_DDD_LIST.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {/* Número */}
        <input
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
          placeholder={selectedCountry.hasDDD ? '999999999' : 'número'}
          className={cn(inputClass, 'flex-1 min-w-0')}
          maxLength={11}
        />
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
