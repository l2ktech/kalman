<template>
	<div id="app">
		<NavBar />
		<router-view />
	</div>
</template>
<script>
import NavBar from "./components/NavBar.vue";

export default {
	name: "app",
	components: {
		NavBar
	}
};
</script>
<style>
@import "~inter-ui/inter-hinted.css";

html {
	font-family: "Inter", sans-serif;
}

@supports (font-variation-settings: normal) {
	html {
		font-family: "Inter var", sans-serif;
	}
}

#app {
	font-family: "Inter", "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	min-height: 100vh;
	background: linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%);
}

body {
	margin: 0;
	padding: 0;
}
</style>
