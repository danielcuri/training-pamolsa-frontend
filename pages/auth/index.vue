<template>
    <div>
        <div class="absolute inset-0">
            <img src="/assets/images/auth/bg-gradient.png" alt="image" class="h-full w-full object-cover" />
        </div>
        <div
            class="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">

            <div
                class="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
                <div
                    class="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                    <div
                        class="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20">
                    </div>
                    <div class="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                        <NuxtLink to="/" class="ms-10 block w-48 lg:w-72">
                            <img src="/assets/images/auth/logo-white.svg" alt="Logo" class="w-full" />
                        </NuxtLink>
                        <div class="mt-24 hidden w-full max-w-[430px] lg:block">
                            <img src="/assets/images/auth/login.svg" alt="Cover Image" class="w-full" />
                        </div>
                    </div>
                </div>
                <div
                    class="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">

                    <div class="w-full max-w-[440px] lg:mt-16">
                        <div class="mb-10">
                            <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                                Sign in
                            </h1>
                            <p class="text-base font-bold leading-normal text-white-dark">
                                Enter your email and password to login
                            </p>
                        </div>

                        <form class="space-y-5 dark:text-white" @submit.prevent="handleLogin">
                            <div>
                                <label for="Email">Email</label>
                                <div class="relative text-white-dark">
                                    <input
                                        id="Email"
                                        v-model="email"
                                        type="email"
                                        placeholder="Enter Email"
                                        class="form-input ps-10 placeholder:text-white-dark"
                                        :disabled="loading"
                                    />
                                    <span class="absolute start-4 top-1/2 -translate-y-1/2">
                                        <icon-mail :fill="true" />
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label for="Password">Password</label>
                                <div class="relative text-white-dark">
                                    <input
                                        id="Password"
                                        v-model="password"
                                        type="password"
                                        placeholder="Enter Password"
                                        class="form-input ps-10 placeholder:text-white-dark"
                                        :disabled="loading"
                                    />
                                    <span class="absolute start-4 top-1/2 -translate-y-1/2">
                                        <icon-lock-dots :fill="true" />
                                    </span>
                                </div>
                            </div>

                            <!-- mensaje de error -->
                            <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

                            <button
                                type="submit"
                                :disabled="loading"
                                class="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] disabled:opacity-60"
                            >
                                <span v-if="loading">Cargando...</span>
                                <span v-else>Sign ini</span>
                            </button>
                        </form>
                    </div>

                    <p class="absolute bottom-6 w-full text-center dark:text-white">
                        © {{ year }}. VRISTO All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import appSetting from '@/app-setting';

useHead({ title: 'Login' });

definePageMeta({
    layout: 'auth-layout',
})

const year = new Date().getFullYear()
const { setLocale } = useI18n()
const { login, loading, error } = useAuth()

const email    = ref('')
const password = ref('')

const handleLogin = async () => {
    console.log(113)
    if (!email.value || !password.value) return
    await login(email.value, password.value)
}


</script>