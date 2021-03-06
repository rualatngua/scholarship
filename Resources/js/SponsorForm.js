Ext.ns('vn.demand.scholarship');

vn.demand.scholarship.SponsorForm = Ext.extend(Ext.form.FormPanel, {
	// data
	payment: null,
	kid: null,
	sponsor: null,
	sponsorPayment: null,
	
    // defaults - can be changed from outside
    border: false,
    frame: true,
    labelWidth: 80,
    url: null,
	plugins: ['msgbus'],
    
    constructor: function(config){
        config = config ||
        {};
        config.listeners = config.listeners ||
        {};
        Ext.applyIf(config.listeners, {
            actioncomplete: function(){
                if (console && console.log) {
                    console.log('actioncomplete:', arguments);
                }
            },
            actionfailed: function(){
                if (console && console.log) {
                    console.log('actionfailed:', arguments);
                }
            }
        });
        vn.demand.scholarship.SponsorForm.superclass.constructor.call(this, config);
    },
    initComponent: function(){
        // hard coded - cannot be changed from outsid
        var config = {
            defaultType: 'textfield',
			defaults: {
                anchor: '-24'
            },
            monitorValid: true,
            autoScroll: true, // ,buttonAlign:'right'
            labelAlign: 'top',
            labelWidth: 120,
			layout: "tableform",
			layoutConfig: {
			     columns: 2,
			     columnWidths: [0.5,0.5]
			}  
            ,items: [{
				name: 'name',
                fieldLabel: _('Name'),
				allowBlank: false,
				xtype: 'combo',
				store: App.data.sponsorStore,
				mode: 'local',
				displayField: 'name',
				valueField: 'sponsorId',
				typeAhead: true,
		        forceSelection: false,
		        triggerAction: 'all',
		        emptyText:'Select a sponsor or type new one...',
		        selectOnFocus:true,
				listeners: {
					'select': function(cb, record, index) {
						this.sponsor = record
						this.getForm().loadRecord(record)
					}
					,scope: this
				}
            }, {
				name: 'title',
                fieldLabel: _('Title')
            }, {
				name: 'phone',
				fieldLabel: _('Phone')
            }, {
				name: 'email',
				fieldLabel: _('Email'),
				vtype: 'email'
			}, {
				name: 'date_start',
                fieldLabel: _('Date start'),
				xtype: 'datefield'
            }, {
				name: 'date_end',
                fieldLabel: _('Date end'),
				xtype: 'datefield'
            }, {
				name: 'amount',
				fieldLabel: _('***Amount***'),
				value: 900000,
				allowBlank: false
            }, {
				name: 'date_in',
                fieldLabel: _('Date in'),
				xtype: 'datefield'
            }, {
				name: 'extra_support',
				fieldLabel: _('Extra support'),
            }, {
				name: 'note',
				fieldLabel: _('Note')
			}, {
				name: 'address',
				fieldLabel: _('Address'),
				colspan: 2
			}],
            buttons: [{
                text: 'Submit',
                formBind: true,
                scope: this,
				plugins: 'defaultButton',
                handler: this.submit
            }, {
                text: 'Reset',
                scope: this,
                handler: this.onResetClick
            }]
        }; // eo config object
        // apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        
        // call parent
        vn.demand.scholarship.SponsorForm.superclass.initComponent.apply(this, arguments);
        
    } // eo function initComponent
    /**
     * Form onRender override
     */
    ,
    onRender: function(){
    
        // call parent
        vn.demand.scholarship.SponsorForm.superclass.onRender.apply(this, arguments);
        
        // set wait message target
        this.getForm().waitMsgTarget = this.getEl();
        
		if (this.payment) {
			this.getForm().loadRecord(this.payment);
			var cb = this.getForm().findField('name');
			var cbItem = cb.getStore().indexOfId(this.payment.get('sponsorId'));
			var sponsor = cb.getStore().getById(this.payment.get('sponsorId'));
			console.log('```````````````cbItem=' + cbItem)
			cb.setValue(this.payment.get('sponsorId'));
			cb.fireEvent('select', cb, sponsor, 0)
		}
		
		//cb.select(cbItem);
        // loads form after initial layout
        // this.on('afterlayout', this.onLoadClick, this, {single:true});
    
    } // eo function onRender
    /**
     * Submits the form. Called after Submit buttons is clicked
     * @private
     */
    ,
    submit: function(){
		var values = this.getForm().getValues();
		try {
			var selectedSponsor = this.getForm().findField('name').getValue();
			var isNewSponsor = true;
			if (this.sponsor != null) {
				isNewSponsor = selectedSponsor == values.name
			}
			console.log('``````````````isNewSponsor: ' + isNewSponsor)
			
			if (isNewSponsor) {
				this.sponsor = {};
				this.sponsor.sponsorId = Sponsor.nextId();
				this.sponsor.name= values.name; 
				this.sponsor.address= values.address; 
				this.sponsor.phone= values.phone;
				this.sponsor.email= values.email;
				this.sponsor.title= values.title;
				App.data.sponsorStore.addSponsor(this.sponsor)
				this.sponsor = App.data.sponsorStore.getById(this.sponsor.sponsorId)
			} else {
				this.sponsor.set('name', values.name);
				this.sponsor.set('title', values.title);
				this.sponsor.set('email', values.email);
				this.sponsor.set('address', values.address);
				this.sponsor.set('phone', values.phone);
				this.sponsor.set('note', values.note);
				App.data.sponsorStore.loadData([this.sponsor], false)
			}
			App.data.sponsorStore.load();
			
			var isNewPayment = this.payment == null;
			if (isNewPayment) {
				this.payment = new Payment({
					paymentId: isNewPayment ? Payment.nextId() : this.payment.paymentId,
				});
			}
			this.payment.beginEdit();
			this.payment.set('sponsorId', this.sponsor.id);
			this.payment.set('kidId', this.kid.get('kidId'));
			this.payment.set('amount', values.amount);
			this.payment.set('extra_support', values.extra_support);
			this.payment.set('note', values.note);
			
			var s = this.getForm().findField('date_start').getValue();
			if (s && Ext.isDate(s)) {
				this.payment.set('date_start', s);
			}
			s = this.getForm().findField('date_end').getValue();
			if (s && Ext.isDate(s)) {
				this.payment.set('date_end', s);
			}
			s = this.getForm().findField('date_in').getValue();
			if (s && Ext.isDate(s)) {
				this.payment.set('date_in', s);
			}
			if (isNewPayment) {
		        App.data.paymentStore.insert(0, this.payment)
				App.data.paymentStore.load();
				this.payment = App.data.paymentStore.getById(this.payment.get('paymentId'));
			} else {
				this.payment.endEdit();
			}
		} catch (e) {
			console.log(e);
			Ext.Msg.alert(e)
		}
    } // eo function submit
    /**
     * Success handler
     * @param {Ext.form.BasicForm} form
     * @param {Ext.form.Action} action
     * @private
     */
    ,
    onSuccess: function(form, action){
		Ext.ux.Toast.msg('Password change', 'Your password has been changed');
    } // eo function onSuccess
    /**
     * Failure handler
     * @param {Ext.form.BasicForm} form
     * @param {Ext.form.Action} action
     * @private
     */
    ,
    onFailure: function(form, action){
        this.showError(action.result.error || action.response.responseText);
    } // eo function onFailure
    /**
     * Shows Message Box with error
     * @param {String} msg Message to show
     * @param {String} title Optional. Title for message box (defaults to Error)
     * @private
     */
    ,
    showError: function(msg, title){
        title = title || 'Error';
        Ext.Msg.show({
            title: title,
            msg: msg,
            modal: true,
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        });
    } // eo function showError
}) //eo SponsorForm
// register xtype
Ext.reg('SponsorForm', vn.demand.scholarship.SponsorForm);