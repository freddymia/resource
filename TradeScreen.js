import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styles from './Styles/PCStandardStyle'
import i18n from '../i18n'
import { RefreshControl, ImageBackground, Image, View, ScrollView, Text, TextInput, TouchableOpacity, AsyncStorage, FlatList } from 'react-native'
import { Images, Colors, Metrics } from '../Themes'
import { Actions as NavigationActions } from 'react-native-router-flux'
import AlertMessage from '../Components/AlertMessage'
import TradeActions from '../Redux/TradeRedux'

class TradeScreen extends React.PureComponent {

    static propTypes = {
        dispatch: PropTypes.func,
        fetching: PropTypes.bool,
        attemptLogin: PropTypes.func,
        attemptAuthenticate: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = {
            tradeDTO: {},
            loading: true,
            done: false,
            dataObjects: [],
            searchValue: '',
            editProject: false,
            fromProjectDetails: false
        }
    }

    componentWillMount() {
        this._search('')
        this.recoverData();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.trades_) {
            this.setState({
                dataObjects: newProps.trades_,
            })
        }
    }

    recoverData = () => {
        AsyncStorage.getItem('tradeDTO')
            .then((valor) => {
                const recoverTradeDTO = valor ? JSON.parse(valor) : ''
                console.info('tradeDTO IN ', JSON.stringify(recoverTradeDTO))
                this.setState({
                    tradeDTO: recoverTradeDTO,
                })
            })

            AsyncStorage.getItem('fromConfirmDetails')
            .then((valor) => {
                    const fromConfirmDetails = valor ? JSON.parse(valor) : false
                    this.setState({
                        editProject: fromConfirmDetails
                    })
            })

            AsyncStorage.getItem('fromProjectDetails')
            .then((valor) => {
                const value = valor ? JSON.parse(valor) : ''
                if (value && value != '') {
                    this.setState({
                        fromProjectDetails: value
                    });
                }
            })
    }

    _renderItem({ item }) {

        // style normal button
        let colorText = Colors.black;
        let style = styles.rectangleCompSelected;

        // style select button
        if (item.id != this.state.tradeDTO.id) {
            colorText = Colors.white;
            style = styles.rectangleCompTS;
        }

        return (
            <TouchableOpacity onPressIn={this._onPress.bind(this, { tradeDTO: item })}
                style={styles.doneButtonWrapper}>
                <View style={style}>
                    <Text numberOfLines={2} ellipsizeMode='tail' style={{
                        color: colorText,
                        fontSize: Metrics.screenHeight / 46,
                        textAlign: "center",
                        fontWeight: "bold",
                        paddingHorizontal: 8
                    }}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _onPress(newProps) {
        if (newProps.tradeDTO) {
            this.setState({
                tradeDTO: newProps.tradeDTO
            });
        }
    }

    renderEmpty = () =>
        <AlertMessage title='No Trades Found' />

    keyExtractor = (item, index) => String(index)

    fetchTrades = () => {
        this.props.getAllTrades({ page: 0, sort: 'name,asc', size: 999 });
    }

    searchTrades = (value) => {
        this.props.searchTrades(value);
    }

    handleLoadMore = () => {
        this.fetchTrades()
    }

    navigateTo() {
        AsyncStorage.setItem('tradeDTO', JSON.stringify(this.state.tradeDTO))
        console.log('tradeDTO OUT', JSON.stringify(this.state.tradeDTO));
        NavigationActions.pcspecialties(this);

        if (this.state && this.state.editProject && this.state.editProject === true) {
            this.setState({ valuePicture: true })
        }else {
            this.setState({ valuePicture: false })
        }
    }

    _search(valueForSearch) { //added input search value because if we get search value from LOCAL STATE it is outdated
        this.searchTrades({ page: 0, sort: 'name,asc', size: 999, searchValue: valueForSearch });
        if (this.props.trades_) {
            console.log('SEARCH:', this.props.trades_);
        }
    }

    componentWillUpdate(newProps) {
        if (newProps.trades_) {
            this.setState({ dataObjects: newProps.trades_ });
        }
    }

    componentWillUnmount() {
        this.setState({ searchValue: '' })
    }

    render() {
        const pcPicture = Images.projectCreation
        const epPicture = Images.editProject
        let valuePicture = (this.state && this.state.fromProjectDetails && this.state.fromProjectDetails === true) ? true : false

        if (valuePicture) {
            sectionImage = 
            <Image style={styles.imageBackHeader} source={epPicture} />
        }else{
            sectionImage = 
            <Image style={styles.imageBackHeader} source={pcPicture} />
        }

        return (
            <ImageBackground source={Images.backgroundCarbono} style={styles.toolbeltBackground}>
                <View style={{ paddingLeft: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image style={styles.imageIcon} source={Images.iconLogo} />
                        {sectionImage}
                    </View>
                </View>
                <ScrollView
                    contentContainerStyle={{ justifyContent: 'center' }}
                    style={[styles.container]}
                    keyboardShouldPersistTaps='always'>
                    <View style={styles.contentText}>
                        <View style={styles.topPadding}>
                            <Text style={styles.rowLabelWhat}>
                                {i18n.t('whattrade.whattradethisproject')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <TextInput
                            value={this.state.searchValue}
                            onChangeText={(searchValue) => { this.setState({ searchValue }); this._search(searchValue) }}
                            placeholder="SEARCH..."
                            placeholderTextColor={Colors.gray}
                            style={styles.textSearch}
                            keyboardType='default'
                            autoCapitalize='none'
                            autoCorrect={false}
                            underlineColorAndroid={Colors.brandPrimary}
                            borderBottomWidth={1}
                            borderBottomColor={Colors.brandPrimary}
                        ></TextInput>
                    </View>
                    <FlatList
                        paddingTop={10}
                        horizontal={false}
                        numColumns={2}
                        contentContainerStyle={styles.container}
                        data={this.state.dataObjects}
                        renderItem={this._renderItem.bind(this)}
                        keyExtractor={this.keyExtractor}
                        onEndReached={this.handleLoadMore}
                        onEndThreshold={100}
                        ListEmptyComponent={this.renderEmpty}
                        ItemSeparatorComponent={this.renderSeparator}
                        refreshControl={
                            <RefreshControl refreshing={this.state.isRefreshing} />
                        }
                    />
                    <View style={styles.topPaddingDone}>
                        <View style={[styles.doneRow]}>
                            <TouchableOpacity style={styles.doneButtonWrapper}
                                onPress={this.navigateTo.bind(this)}>
                                <View style={styles.doneButton}>
                                    <Text style={styles.doneText}>
                                        {i18n.t('titleproject.done')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        )
    }
}

const mapStateToProps = state => {
    return {
        trades: state.trades.trades,
        trades_: state.trades.trades_,
        fetching: state.trades.fetchingAll,
        error: state.trades.errorAll
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getAllTrades: (options) => dispatch(TradeActions.tradeAllRequest(options)),
        searchTrades: (options) => dispatch(TradeActions.tradeSearchRequest(options))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TradeScreen)
