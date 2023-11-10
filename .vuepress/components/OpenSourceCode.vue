<template>
  <div class="open-source-code">
    <MagicCard v-for="item of data[type]" :key="item.name" class="open-source-code__item">
      <h4>
        <span>{{ item.name }}</span>
        <span>
          <img :src="`https://img.shields.io/github/stars/${item.repo}`" height="18" />
        </span>
      </h4>
      <p>{{ item.desc }}</p>
      <a class="open-source-code__link" :href="item.link" target="_blank">Go</a>
    </MagicCard>
  </div>
</template>

<script lang="ts" setup>
import data from "../data/open-source-code";

defineProps<{
  type: string;
}>();

defineOptions({
  name: "OpenSourceCode",
});
</script>

<style lang="scss" scoped>
.open-source-code {
  display: grid;
  max-width: 1024px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;

  &__item {
    padding: 1rem 1.5rem;
    position: relative;

    p {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    h4 {
      display: flex;
      align-items: center;
      margin-top: 0;
      margin-bottom: 0;
      padding-top: 0;
      gap: 1rem;
    }

    &:hover {
      .open-source-code__link {
        opacity: 1;
        right: 50%;
        bottom: 50%;
        transform: translate(50%, 50%);
      }
    }
  }

  & &__link {
    opacity: 0;
    position: absolute;
    right: 0px;
    bottom: 0px;
    display: block;
    height: 40px;
    width: 40px;
    line-height: 40px;
    cursor: pointer;
    background-color: rgb(93, 103, 232);
    text-align: center;
    color: #fff !important;
    border-radius: 50%;
    transition: all 0.5s ease-in-out;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (min-width: 768px) {
  .open-source-code {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
