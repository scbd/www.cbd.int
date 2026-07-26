<template>
  <span v-if="show" class="mr-2 text-nowrap" :class="cssClass" :title="title">
    <i class="fa fa-language"></i> {{ count || '' }}
  </span>
</template>
<script>

import { getLanguageName as languageName } from '~/data/languages'

export default {
  name      : 'AiTranslationBadge',
  props     : {
    intervention : { type: Object, required: true },
  },
  computed  : { entries, pending, errors, count, show, cssClass, title }
}

// Produced files are the finished product, but a freshly requested language has no file yet - only
// a `translations` entry - so the badge reads both: the count is files, the colour is the entries.
function entries() {
  return Object.entries(this.intervention.translations||{});
}

// Statuses come from the translation service: `done` once the file lands, `pending` while it works,
// anything else (typically `failed`) is an error carrying a message.
function pending() {
  return this.entries.filter(([,entry]) => entry.status=='pending');
}

function errors() {
  return this.entries.filter(([,entry]) => entry.status!='pending' && entry.status!='done');
}

// A requested language has an entry before it has a file, an imported file can have a file without
// an entry - the badge counts whichever is ahead, so it never reads lower than what was asked for.
function count() {
  const files = (this.intervention.files||[]).filter(f => f.autoTranslated).length;

  return Math.max(files, this.entries.length);
}

function show() {
  return !!this.count;
}

function cssClass() {
  if(this.errors .length) return 'text-danger';
  if(this.pending.length) return 'text-warning';

  return 'text-success';
}

function title() {
  const lines = [ this.$t('Automatic translations') ];

  if(this.pending.length)
    lines.push(`${this.$t('Pending')}: ${this.pending.map(([lang]) => languageName(lang)).join(', ')}`);

  for(const [ lang, entry ] of this.errors)
    lines.push(`${languageName(lang)}: ${entry.error || entry.status}`);

  return lines.join('\n');
}

</script>
