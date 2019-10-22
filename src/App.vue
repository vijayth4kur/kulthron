<template>
<section id ="app">
    <header class="wrapper boxshadow">
        <div class="logo">
            <img class="logo-img" src="/kulthorn-logo.png">
             <button class="refesh-page"  v-on:click="tap('stop')">  <img class="refesh-pageimage" src="/refreshicon.png"></button>
        </div>
    </header>

    <main class="wrapper ai-window boxshadow">

        <!-- Display Welcome Message -->
        <div v-if="answers.length == 0 && online == true">
            <h1 class="title mdc-typography--headline">
                
                <!--{{config.locale.strings.welcomeTitle}}

                <p class="mdc-typography--body2">{{config.locale.strings.welcomeDescription}}</p>
                
                <br>
                <div class="material-icons down">arrow_downward</div>-->
                <p>Hi there! What may I help you with, today?</p>
                <button v-on:click="tap('Find a cross-reference/alternative model')" class="btn">Find a cross-reference/alternative model</button>
                <button v-on:click="tap('Identify the right compressor for me')" class="btn">Identify the right compressor for me</button>
                <button v-on:click="tap('I need a specification sheet')" class="btn">I need a specification sheet</button>
                <!-- <button v-on:click="tap('Troubleshooting Guide')" class="btn">Troubleshooting Guide</button> -->
            </h1>
        </div>

        <!-- Display offline message -->
        <div v-if="answers.length == 0 && online == false">
            <h1 class="title mdc-typography--headline">
                {{config.locale.strings.offlineTitle}}

                <p class="mdc-typography--body2">{{config.locale.strings.offlineDescription}}</p>
                
                <br>
                <div class="material-icons down">cloud_off</div>
            </h1>
        </div>

        <!-- Chat window -->
        <table v-for="a in answers" class="chat-window">

            <!-- Your messages -->
            <tr>
                <td class="bubble">{{a.result.resolvedQuery}}</td>
            </tr>

            <!-- Dialogflow messages -->
            <tr>
                <td>

                    <!-- Bot message types / Speech -->
                    <div v-if="a.result.fulfillment.speech" style="clear:both;">
                        <div class="bubble bot">
                            {{a.result.fulfillment.speech}}
                        </div>
                    </div>

                    <!-- Google Assistant output -->
                    <div v-for="r in a.result.fulfillment.messages" style="clear:both;">
                        
                        <div v-if="r.speech && !a.result.fulfillment.speech" class="bubble bot">
                            {{r.speech}}
                        </div>

                        <!-- Bot message types / Card -->

                        <div v-if="(a.result.metadata.intentName == 'specSheetYes' || a.result.metadata.intentName == 'needSpecificationSheet') && r.buttons" class="bubble bot">
                            Click <a :href="r.buttons[0].postback" target="_blank">here</a> to view spec sheet.
                        </div>

                        <div class="mdc-card" v-if="r.type == 'basic_card'">
                            <img :title="r.image.accessibilityText" :alt="r.image.accessibilityText" class="mdc-card__media-item" :src="r.image.url" v-if="r.image">
                            <section class="mdc-card__primary">
                                <h1 class="mdc-card__title">{{r.title}}</h1>
                                <br>
                                <h2 class="mdc-card__subtitle">{{r.subtitle}}</h2>
                            </section>
                            <section class="mdc-card__supporting-text">
                                {{r.formattedText}}
                            </section>
                            <section class="mdc-card__actions" v-for="button in r.buttons">
                                <a class="mdc-button mdc-button--compact themed mdc-card__action" target="_blank" :href="button.openUrlAction.url">{{button.title}} <i class="material-icons openlink">open_in_new</i></a>
                            </section>
                        </div>

                        <!-- Bot message types / Carousel Card -->

                        <div class="slider" v-if="r.type == 'carousel_card'">
                            <carousel 
                                    :perPage="1" 
                                    :navigationEnabled="true"
                                    :paginationEnabled="false"
                                    navigationNextLabel="<button class='mdc-fab mdc-fab--mini material-icons rightnav'><span class='mdc-fab__icon'>keyboard_arrow_right</span></button>"
                                    navigationPrevLabel="<button class='mdc-fab mdc-fab--mini material-icons leftnav'><span class='mdc-fab__icon'>keyboard_arrow_left</span></button>"
                                    :navigationClickTargetSize="0"
                                    :loop="true">

                                <slide v-for="item in r.items" :key="item.id">
                                    <div class="mdc-card slide">
                                        <img class="mdc-card__media-item" :src="item.image.url" v-if="item.image">
                                        <section class="mdc-card__primary">
                                            <h1 class="mdc-card__title themed" @click="autosubmit(item.optionInfo.key)">{{item.title}}</h1>
                                        </section>
                                        <section class="mdc-card__supporting-text">
                                            {{item.description}}
                                        </section>
                                    </div>
                                </slide>
                            </carousel>
                        </div>

                        <!-- Bot message types / List -->

                        <div class="mdc-list-group mdc-card" v-if="r.type == 'list_card'">
                            <h3 class="mdc-list-group__subheader">{{r.title}}</h3>
                            <ul class="mdc-list mdc-list--two-line mdc-list--avatar-list" v-for="item in r.items" @click="autosubmit(item.optionInfo.key)">
                                <li class="mdc-list-item">
                                    <img :title="item.image.accessibilityText" :alt="item.image.accessibilityText" class="mdc-list-item__start-detail" width="56" height="56" :src="item.image.url" v-if="item.image"/>
                                    <span class="mdc-list-item__text">
                                        {{item.title}}
                                    <span class="mdc-list-item__text__secondary">{{item.description}}</span>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <!-- Bot message types / Link Chip -->

                        <div v-if="r.type == 'link_out_chip'" class="chips">
                            <a class="suggestion link" :href="r.url" target="_blank">
                                {{r.destinationName}} <i class="material-icons openlink">open_in_new</i>
                            </a>
                        </div>

                        <!-- Bot message types / Suggestion Chip -->

                        <div v-if="r.type == 'suggestion_chips'" class="chips">
                            <div class="suggestion" @click="autosubmit(s.title)" v-for="s in r.suggestions">
                                {{s.title}}
                            </div>
                        </div>

                        <div v-if="r.replies" class="chips">
                            <div class="suggestion" @click="autosubmit(s)" v-for="s in r.replies">
                                {{s}}
                            </div>
                        </div>

                        <!-- Bot message types / Google Suggestion Chip -->

                        <div v-if="r.unknown == true" class="google-chip chips">
                            <a class="suggestion" :href="'https://www.google.com/search?q=' + r.text" target="_blank">
                                Search for "{{r.text}}" on Google <i class="material-icons openlink">search</i>
                            </a>
                        </div>

                    </div>
                </td>
            </tr>
        </table>

        <!--<br>
        <p class="copyright" v-if="answers.length > 0">Proudly powered by <a href="https://ushakov.co">Ushakov</a> & <a href="https://dialogflow.com">Dialogflow</a></p>-->

        <a id="bottom"></a>
    </main>

    <!-- The input -->
    <div class="wrapper query boxshadow">
        <div v-if="micro == false">
            <!--<i class="material-icons iicon" @click="microphone(true)">mic</i>-->
            <input :aria-label="config.locale.strings.queryTitle" autocomplete="on" v-model="query" class="queryform" @keyup.enter="submit()" :placeholder="config.locale.strings.queryTitle" :disabled="loading" :class="{'disable': loading}" autofocus type="text">
            <!--<i class="material-icons iicon t2s" @click="mute(true)" v-if="muted == false">volume_up</i>
            <i class="material-icons iicon t2s" @click="mute(false)" v-else>volume_off</i>-->
        </div>
        <div v-else>
            <i class="material-icons iicon recording" @click="microphone(false)">mic</i><input class="queryform" :placeholder="speech" readonly>   
        </div>
        <img v-if="loading" id="loader" src="/loader.gif">
    </div>

</section>
</template>

<style lang="sass">
@import url('https://fonts.googleapis.com/css?family=Roboto')
@import "App.sass"
</style>

<script>
import { ApiAiClient } from 'api-ai-javascript'
import config from './../config'

const client = new ApiAiClient({accessToken: config.app.token}) // <- replace it with yours

export default {
    name: 'app',
    data: function(){ //console.log('data');
        return {
            loading: false,
            answers: [],
            query: '',
            speech: config.locale.strings.voiceTitle,
            micro: false,
            muted: config.app.muted,
            online: navigator.onLine,
            config
        }
    },
    watch: {
        answers: function(val){ 
            setTimeout(() => { 
                document.querySelector('#bottom').scrollIntoView({ 
                    behavior: 'smooth' 
                })
            }, 2) // if new answers arrive, wait for render and then smoothly scroll down to #bottom selector, used as anchor
        }
    },
    methods: {
        submit(){
            //console.log('query-'+this.query);
            if(this.query !== ''){
                let query = this.query
                this.query = ''
                this.loading = true
                client.textRequest(query).then((response) => {
                    this.loading = false
                    if(query == 'stop'){
                        location.reload();
                    }else{
                        if(response.result.action == "input.unknown" && this.config.app.googleIt == true){
                            response.result.fulfillment.messages[0].unknown = true
                            response.result.fulfillment.messages[0].text = response.result.resolvedQuery
                        } // if the googleIt is enabled, show the button

                        this.answers.push(response)
                        this.handle(response) // <- handle the response in handle() method

                        this.query = ''
                        this.speech = config.locale.strings.voiceTitle // <- reset query and speech
                    }
                })
            }
        },
        handle(response){
            //console.log('handle');
            if(response.result.fulfillment.speech || response.result.fulfillment.messages[0].speech || response.result.fulfillment.messages[0].type == 'simple_response'){
                let speech = new SpeechSynthesisUtterance(response.result.fulfillment.speech || response.result.fulfillment.messages[0].speech || response.result.fulfillment.messages[0].textToSpeech)
                speech.voiceURI = 'native'
                speech.lang = config.locale.settings.speechLang

                if(this.muted == false) window.speechSynthesis.speak(speech) // <- Speech output if microphone is allowed
            }
            //this.scrollToEnd();
        },
        autosubmit(suggestion){
            var elements = document.getElementsByClassName('suggestion');
            for(var i=0; i<elements.length; i++){
                elements[i].classList.add("sug-disable");
            }
            
            this.query = suggestion
            this.submit()
        },
        mute(mode){
            this.muted = mode
        },
        microphone(mode){
            this.micro = mode
            let self = this // <- correct scope

            if(mode == true){
                let recognition = new webkitSpeechRecognition() // <- chrome speech recognition

                recognition.interimResults = true
                recognition.lang = config.locale.settings.recognitionLang
                recognition.start()

                recognition.onresult = function(event){
                    for (var i = event.resultIndex; i < event.results.length; ++i){
                        self.speech = event.results[i][0].transcript
                    }
                }

                recognition.onend = function(){
                    recognition.stop()
                    self.micro = false
                    self.autosubmit(self.speech)
                }
            }
        },
        tap(str){
            this.query = str;
            this.submit();
        }
    }
}
</script>