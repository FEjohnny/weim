<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'App'
    };
</script>

<style>
    html, body, h1, h2, h3, h4, h5, h6, p, ul, ol, table, pre {
        padding: 0px;
        margin: 0px;
    }

    body {
        background: #EBEBEB;
    }
    #app {
        font-family: PingFangSC-Regular,'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
