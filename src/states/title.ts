import * as Assets from '../assets';
import { Button } from 'phaser-ce';

export default class Title extends Phaser.State {
    playButton: Button;

    public preload() {
        this.game.load.image('button', Assets.Images.ImagesButton.getPNG());
        this.game.load.image('background', Assets.Images.ImagesBackground.getPNG());
    }

    public create() {
        this.playButton = this.add.button(0, 0, 'button', this.startGame, this);
        this.playButton.width = 300;
        // Set background
        this.stage.setBackgroundColor('rgb(255, 255, 255)');
    }

    public startGame() {
        this.state.start('Game');
    }
}
