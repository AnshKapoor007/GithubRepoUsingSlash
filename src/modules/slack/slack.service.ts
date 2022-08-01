import { Injectable, Redirect, Req } from '@nestjs/common';
import { ConfigService } from 'src/shared/config.service';
import { WebClient, WebAPICallResult, ErrorCode } from '@slack/web-api';
import { RollbarHandler } from 'nestjs-rollbar';
import axios from "axios";

@Injectable()
export class SlackService {
    private _clientId: string;
    private _clientSecret: string;
    private _webClient: WebClient;

    constructor(private _configService: ConfigService) {
        this._webClient = new WebClient();
        this._clientId = this._configService.get('SLACK_CLIENT_ID');
        this._clientSecret = this._configService.get('SLACK_CLIENT_SECRET');
    }

    @RollbarHandler()
    async oauthAccess(
        code: string,
        redirectUri: string,
    ): Promise<WebAPICallResult> {
        const data = {
            code: code,
            client_id: this._clientId,
            client_secret: this._clientSecret,
            redirect_uri: redirectUri,
        };
        let response;
        try {
            response = await this._webClient.oauth.v2.access(data);
        } catch (error) {
            if (error.code === ErrorCode.PlatformError) {
                response = error.data;
            } else {
                throw new Error(error);
            }
        }

        return response;
    }

    initSlackCommand(boltApp: any): void {
        boltApp.command('/hello', async ({ command, ack, respond }) => {
            await ack();
            await respond("Hello " + command.text);
        });

        boltApp.command('/repo', async ({ command, ack, respond }) => {
            await ack();
            if (command.text == "connect")
                await respond(`Click to login: https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=${process.env.GITHUB_REDIRECT_URL}?path=${process.env.GITHUB_PATH}&scope=user:email&scope=repo`);
            else if (command.text.startsWith("create ")) {
                var accessToken = process.env.GITHUB_ACCESS_TOKEN;
                await axios
                    .post(
                        `https://api.github.com/user/repos`,
                        {
                            name: command.text.slice(7),
                            description: "New Repo",
                            homepage: `https://github.com/${command.text.slice(7)}`,
                            private: false,
                        },
                        {
                            headers: {
                                Accept: "application/vnd.github+json",
                                Authorization: `token ${accessToken}`,
                            },
                        }
                    )
                    .then(async (res) => {
                        await respond("Creating repository '" + command.text.slice(7) + "'");
                        await respond("Repository created successfully: '" + res.data.html_url + "'");
                    })
                    .catch(async (err) => {
                        var errmsg = err.response.data.message === "Bad credentials" ? "Connection problem (connect before creating a repository)" : err.response.data.message;
                        await respond("Error: '" + errmsg + "'");
                    });
            }
            else
                await respond("Incorrect Command '" + command.text + "'");
        });
    }
}
