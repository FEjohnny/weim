<template>
    <div id="spinner-wraper">
        <div class="spinner"></div>
        <div>{{loadingText}}</div>
    </div>
</template>

<script>
    export default {
        name: 'LoadingPage',
        props: ['loadingText']
    };
</script>

<style scoped>

</style>
