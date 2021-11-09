const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
	const isDev = argv.mode === 'development';
	const isProd = !isDev;

	const optimization = () => {
		const config = {
			splitChunks: {
				chunks: isProd ? 'all' : 'initial',
			},
		};

		if (isProd) {
			config.minimizer = [new CSSMinimizerPlugin(), new TerserWebpackPlugin()];
		}

		return config;
	};

	const filename = (ext) => {
		if (ext) {
			return isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
		} else {
			return isDev ? `[name].[ext]` : `[name].[contenthash].[ext]`;
		}
	};

	const plugins = () => {
		const base = [
			new HTMLWebpackPlugin({
				template: './index.html',
				minify: {
					collapseWhitespace: isProd,
				},
			}),
			new CleanWebpackPlugin(),
			new MiniCSSExtractPlugin({
				filename: filename('css'),
			}),
		];

		return base;
	};

	return {
		mode: argv.mode,
		context: path.resolve(__dirname, 'src'),
		entry: {
			main: ['@babel/polyfill', './js/index.ts'],
		},
		output: {
			filename: filename('js'),
			path: path.resolve(__dirname, 'dist'),
		},
		resolve: {
			extensions: ['.ts', '.js'],
			alias: {
				assets: path.resolve(__dirname, 'src/assets/'),
			},
		},
		module: {
			rules: [
				{
					test: /\.s[ac]ss$/,
					use: [MiniCSSExtractPlugin.loader, 'css-loader', 'sass-loader'],
				},
				{
					test: /\.tsx?$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env'],
							},
						},
						'ts-loader',
					],
					include: path.join(__dirname, 'src'),
					exclude: /node_modules/,
				},
				{
					test: /\.(png|jpg|jpeg|svg|gif)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: `assets/images/${filename()}`,
							},
						},
					],
				},
				{
					test: /\.(ttf)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: `assets/fonts/${filename()}`,
								esModule: false,
							},
						},
					],
				},
			],
		},
		plugins: plugins(),
		optimization: optimization(),
		devServer: {
			port: 3000,
			hot: isDev,
		},
		performance: {
			hints: false,
		},
		devtool: isDev ? 'source-map' : false,
	};
};
