<script setup lang="ts">
defineProps<{
  /** Column headings. The first names the row-header column. */
  columns: string[]
  /** One array of cells per row, in column order. */
  rows: string[][]
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-grey-100">
    <table class="w-full text-left text-sm">
      <thead class="border-b border-grey-100 bg-grey-50 text-fg-secondary">
        <tr>
          <th
            v-for="column in columns"
            :key="column"
            scope="col"
            class="px-4 py-3 font-semibold"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- The first cell is the row's header rather than a data cell, so a
             screen reader can name the state a given description belongs to. -->
        <tr
          v-for="row in rows"
          :key="row[0]"
          class="border-b border-grey-100 last:border-0"
        >
          <th scope="row" class="px-4 py-3 font-semibold text-fg-heading">{{ row[0] }}</th>
          <td
            v-for="(cell, index) in row.slice(1)"
            :key="index"
            class="px-4 py-3 text-fg-secondary"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
