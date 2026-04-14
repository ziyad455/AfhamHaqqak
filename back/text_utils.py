from __future__ import annotations

import re
import unicodedata
from collections import OrderedDict


ARABIC_DIACRITICS_RE = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]")
ARABIC_CHAR_RE = re.compile(r"[\u0600-\u06FF]")
LATIN_CHAR_RE = re.compile(r"[A-Za-zÀ-ÿ]")
TOKEN_RE = re.compile(r"[0-9A-Za-zÀ-ÿ\u0600-\u06FF]+")
MARKDOWN_DECORATION_RE = re.compile(r"[*_`#]+")
ARTICLE_BOUNDARY_RE = re.compile(
    r"(?im)^(?:article|chapitre|section|titre|livre|partie|annexe|المادة|الفصل)\b[^\n]{0,140}$"
)
SENTENCE_SPLIT_RE = re.compile(r"(?<=[\.\!\?؛:])\s+|\n{2,}")

ARABIC_DIGIT_TRANSLATION = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
ARABIZI_TRANSLATION = str.maketrans({"2": "ء", "3": "ع", "5": "خ", "6": "ط", "7": "ح", "8": "غ", "9": "ق"})

FRENCH_STOPWORDS = {
    "le",
    "la",
    "les",
    "des",
    "du",
    "de",
    "un",
    "une",
    "au",
    "aux",
    "dans",
    "pour",
    "avec",
    "sans",
}

DOMAIN_KEYWORDS = {
    "labor": {
        "travail",
        "emploi",
        "salaire",
        "licenciement",
        "contrat",
        "fonctionnaire",
        "fonction publique",
        "travailleur",
        "شغل",
        "عمل",
        "أجير",
        "أجرة",
        "طرد",
        "خدمة",
        "khdma",
        "khedma",
    },
    "rent": {
        "location",
        "loyer",
        "bail",
        "expulsion",
        "locataire",
        "propriétaire",
        "كراء",
        "إفراغ",
        "مكري",
        "مستأجر",
        "kraya",
    },
    "family": {
        "mariage",
        "divorce",
        "garde",
        "pension",
        "filiation",
        "famille",
        "زواج",
        "طلاق",
        "نفقة",
        "حضانة",
        "أسرة",
    },
    "police": {
        "police",
        "plainte",
        "garde à vue",
        "arrestation",
        "procès-verbal",
        "شرطة",
        "شكاية",
        "اعتقال",
        "محضر",
        "حجز",
    },
    "criminal": {
        "crime",
        "délit",
        "contravention",
        "infraction",
        "peine",
        "جنحة",
        "جناية",
        "مخالفة",
        "عقوبة",
    },
    "administrative": {
        "administration",
        "autorisation",
        "réclamation",
        "ministère",
        "commune",
        "fonction publique",
        "إدارة",
        "ترخيص",
        "قرار إداري",
        "وزارة",
        "جماعة",
    },
    "commercial": {
        "commerce",
        "commercial",
        "société",
        "entreprise",
        "registre de commerce",
        "شركة",
        "تجارة",
        "مقاولة",
    },
    "property": {
        "propriété",
        "immobilier",
        "titre foncier",
        "hypothèque",
        "عقار",
        "تحفيظ",
        "رهن",
    },
    "tax": {
        "impôt",
        "taxe",
        "tva",
        "droits d'enregistrement",
        "ضريبة",
        "رسم",
    },
    "customs": {
        "douane",
        "douanes",
        "الجمارك",
        "tarif douanier",
    },
    "civil": {
        "responsabilité",
        "obligation",
        "contrat civil",
        "préjudice",
        "تعويض",
        "التزام",
        "مسؤولية",
    },
}

DARIJA_EXPANSIONS = {
    "khdma": ["travail", "emploi", "عمل", "شغل"],
    "khedma": ["travail", "emploi", "عمل", "شغل"],
    "kraya": ["location", "loyer", "bail", "كراء"],
    "tal9": ["divorce", "طلاق"],
    "tla9": ["divorce", "طلاق"],
    "chikaya": ["plainte", "شكاية"],
    "chikayat": ["plainte", "شكاية"],
    "mokra": ["propriétaire", "مكري"],
    "mostajir": ["locataire", "مستأجر"],
    "ajr": ["salaire", "أجرة"],
}


def dedupe_preserve_order(values: list[str]) -> list[str]:
    seen: "OrderedDict[str, None]" = OrderedDict()
    for value in values:
        cleaned = collapse_whitespace(value)
        if cleaned:
            seen.setdefault(cleaned, None)
    return list(seen.keys())


def normalize_file_name(file_name: str) -> str:
    return re.sub(r" \(\d+\)(?=\.[^.]+$)", "", (file_name or "").strip())


def collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def basic_clean_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
    normalized = normalized.translate(ARABIC_DIGIT_TRANSLATION)
    normalized = re.sub(r"(?m)^---\s*$", "", normalized)
    normalized = MARKDOWN_DECORATION_RE.sub("", normalized)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    return normalized.strip()


def normalize_arabic_text(text: str) -> str:
    normalized = ARABIC_DIACRITICS_RE.sub("", text)
    replacements = {
        "أ": "ا",
        "إ": "ا",
        "آ": "ا",
        "ٱ": "ا",
        "ى": "ي",
        "ؤ": "و",
        "ئ": "ي",
        "ـ": "",
    }
    for source, target in replacements.items():
        normalized = normalized.replace(source, target)
    return normalized


def normalize_query_text(text: str) -> str:
    cleaned = basic_clean_text(text)
    cleaned = normalize_arabic_text(cleaned)
    cleaned = cleaned.lower()
    return collapse_whitespace(cleaned)


def detect_language(text: str) -> str:
    cleaned = text or ""
    arabic_count = len(ARABIC_CHAR_RE.findall(cleaned))
    latin_count = len(LATIN_CHAR_RE.findall(cleaned))
    lowered = cleaned.lower()
    darija_latin_hits = sum(token in lowered for token in DARIJA_EXPANSIONS)

    if arabic_count and latin_count:
        return "mixed"
    if arabic_count:
        return "darija" if darija_latin_hits else "arabic"
    if latin_count:
        french_hits = sum(stopword in lowered.split() for stopword in FRENCH_STOPWORDS)
        if french_hits or any(term in lowered for term in ("droit", "loi", "tribunal", "décret")):
            return "french"
        return "latin"
    return "unknown"


def expand_darija_terms(text: str) -> list[str]:
    lowered = normalize_query_text(text).translate(ARABIZI_TRANSLATION)
    expansions: list[str] = []
    for token, synonyms in DARIJA_EXPANSIONS.items():
        if token in lowered:
            expansions.extend(synonyms)
    return dedupe_preserve_order(expansions)


def infer_legal_domain(text: str) -> str:
    normalized = normalize_query_text(text)
    best_domain = "general"
    best_score = 0
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in normalized)
        if score > best_score:
            best_domain = domain
            best_score = score
    return best_domain


def tokenize_for_bm25(text: str) -> list[str]:
    normalized = normalize_query_text(text)
    return TOKEN_RE.findall(normalized)


def informative_tokens(text: str) -> set[str]:
    tokens = tokenize_for_bm25(text)
    return {token for token in tokens if len(token) > 2 and token not in FRENCH_STOPWORDS}


def _split_large_segment(segment: str, max_chars: int) -> list[str]:
    if len(segment) <= max_chars:
        return [segment.strip()]

    units = [part.strip() for part in SENTENCE_SPLIT_RE.split(segment) if part.strip()]
    if not units:
        return [segment[i : i + max_chars].strip() for i in range(0, len(segment), max_chars)]

    chunks: list[str] = []
    current: list[str] = []
    current_length = 0
    for unit in units:
        unit_length = len(unit)
        if current and current_length + unit_length + 1 > max_chars:
            chunks.append(" ".join(current).strip())
            current = [unit]
            current_length = unit_length
        else:
            current.append(unit)
            current_length += unit_length + 1
    if current:
        chunks.append(" ".join(current).strip())
    return chunks


def split_legal_text(text: str, max_chars: int = 1800, overlap_chars: int = 250) -> list[str]:
    cleaned = basic_clean_text(text)
    boundaries = list(ARTICLE_BOUNDARY_RE.finditer(cleaned))

    if boundaries:
        segments: list[str] = []
        starts = [match.start() for match in boundaries] + [len(cleaned)]
        for index, start in enumerate(starts[:-1]):
            segment = cleaned[start : starts[index + 1]].strip()
            if segment:
                segments.append(segment)
    else:
        segments = [segment.strip() for segment in re.split(r"\n{2,}", cleaned) if segment.strip()]

    atomic_segments: list[str] = []
    for segment in segments:
        atomic_segments.extend(_split_large_segment(segment, max_chars))

    chunks: list[str] = []
    current: list[str] = []
    current_length = 0

    for segment in atomic_segments:
        addition = len(segment) + (2 if current else 0)
        if current and current_length + addition > max_chars:
            chunk = "\n\n".join(current).strip()
            if chunk:
                chunks.append(chunk)
            overlap_seed = chunk[-overlap_chars:].strip() if overlap_chars else ""
            current = [overlap_seed, segment] if overlap_seed else [segment]
            current_length = sum(len(piece) + 2 for piece in current if piece)
        else:
            current.append(segment)
            current_length += addition

    if current:
        chunk = "\n\n".join(piece for piece in current if piece).strip()
        if chunk:
            chunks.append(chunk)

    return dedupe_preserve_order(chunks)


def extract_supporting_excerpt(text: str, query: str, max_chars: int = 280) -> str:
    query_tokens = informative_tokens(query)
    candidates = [candidate.strip() for candidate in SENTENCE_SPLIT_RE.split(basic_clean_text(text)) if candidate.strip()]
    if not candidates:
        return collapse_whitespace(text)[:max_chars]

    best_candidate = candidates[0]
    best_score = -1
    for candidate in candidates:
        score = len(query_tokens & informative_tokens(candidate))
        if score > best_score:
            best_candidate = candidate
            best_score = score

    excerpt = collapse_whitespace(best_candidate)
    return excerpt[: max_chars - 3] + "..." if len(excerpt) > max_chars else excerpt

